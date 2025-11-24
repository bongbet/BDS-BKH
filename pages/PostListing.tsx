import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingContext';
import { Listing, ListingType, PropertyType, ListingStatus, Coords, UserRole } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { LISTING_STATUSES, LISTING_TYPES, PROPERTY_TYPES, PRICE_UNITS, DEFAULT_LISTING_IMAGE_URL } from '../constants';
import { fileToBase64 } from '../utils/helpers';

const PostListing: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // listing ID for editing
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addListing, updateListing, getListingDetails, loading: listingsLoading } = useListings();

  const [initialListing, setInitialListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState<Omit<Listing, 'id' | 'postedAt' | 'views' | 'contactClicks' | 'isHidden'> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // FIX: Removed trailing comma
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      // Fetch existing listing for editing
      const fetchListing = async () => {
        setLoading(true);
        setError(null);
        try {
          const fetchedListing = await getListingDetails(id);
          if (fetchedListing && user && fetchedListing.postedByUserId === user.id) {
            setInitialListing(fetchedListing);
            // Omit 'isHidden' from formData when editing, as it's an admin-only property
            const { isHidden, ...formDataWithoutHidden } = fetchedListing;
            setFormData(formDataWithoutHidden);
            setImagePreviews(fetchedListing.images || []);
          } else {
            alert('Không tìm thấy tin rao hoặc bạn không có quyền chỉnh sửa.');
            navigate('/dashboard'); // Redirect if not found or not authorized
          }
        } catch (err) {
          console.error('Error fetching listing for edit:', err);
          setError('Không thể tải tin rao để chỉnh sửa.');
        } finally {
          setLoading(false);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchListing();
    } else {
      // Initialize form for new listing
      setFormData({
        title: '',
        description: '',
        price: 0,
        priceUnit: 'VND',
        type: ListingType.SALE,
        propertyType: PropertyType.APARTMENT,
        area: 0,
        bedrooms: 0,
        bathrooms: 0,
        address: '',
        district: '',
        city: '',
        coords: { lat: 0, lng: 0 },
        images: [],
        postedByUserId: user?.id || '',
        status: ListingStatus.ACTIVE,
      });
      setLoading(false);
    }
  }, [id, user, getListingDetails, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
      };
    });
  };

  const handleCoordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        coords: {
          ...prev.coords,
          [name]: parseFloat(value) || 0,
        },
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArray]);

      const previews = await Promise.all(filesArray.map(fileToBase64));
      setImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !user) {
      setError('Vui lòng điền đầy đủ thông tin hoặc đăng nhập.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      // Combine existing images from initialListing (if editing) and new uploads
      const base64Images = imagePreviews;

      const listingDataToSend: Omit<Listing, 'id' | 'postedAt' | 'views' | 'contactClicks' | 'isHidden'> = { // Explicitly define type
        ...formData,
        images: base64Images,
        postedByUserId: user.id,
      };

      let success = false;
      let resultListing: Listing | null = null;

      if (id && initialListing) {
        // Update existing listing. `isHidden` is not passed from here, only changeable by admin.
        const response = await updateListing(id, listingDataToSend);
        if (response) {
          success = true;
          resultListing = response;
          alert('Cập nhật tin rao thành công!');
        }
      } else {
        // Create new listing
        const response = await addListing(listingDataToSend);
        if (response) {
          success = true;
          resultListing = response;
          alert('Đăng tin mới thành công!');
        }
      }

      if (success && resultListing) {
        navigate(`/listings/${resultListing.id}`);
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Đã có lỗi xảy ra trong quá trình xử lý.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || listingsLoading || !formData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner message={id ? "Đang tải tin rao..." : "Đang chuẩn bị form..."} />
      </div>
    );
  }

  if (user?.role !== UserRole.AGENT) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-600">Bạn không có quyền đăng tin</h2>
        <p className="text-gray-600 mt-2">Chỉ môi giới/chủ nhà mới có thể đăng tin.</p>
        <Button onClick={() => navigate('/login')} className="mt-4">Đăng nhập với vai trò môi giới</Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{id ? 'Chỉnh sửa tin rao' : 'Đăng tin mới'}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        <Input
          id="title"
          label="Tiêu đề tin rao"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Ví dụ: Căn hộ cao cấp view sông Sài Gòn"
          required
        />
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            className="block w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Mô tả chi tiết về bất động sản..."
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* FIX: Add required prop to Select components */}
          <Input
            id="price"
            label="Giá"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Giá bán/thuê"
            required
            min="0"
          />
          {/* FIX: Add required prop to Select components */}
          <Select
            id="priceUnit"
            label="Đơn vị giá"
            name="priceUnit"
            options={PRICE_UNITS}
            value={formData.priceUnit}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* FIX: Add required prop to Select components */}
          <Select
            id="type"
            label="Loại tin"
            name="type"
            options={LISTING_TYPES}
            value={formData.type}
            onChange={handleInputChange}
            required
          />
          {/* FIX: Add required prop to Select components */}
          <Select
            id="propertyType"
            label="Loại Bất động sản"
            name="propertyType"
            options={PROPERTY_TYPES}
            value={formData.propertyType}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            id="area"
            label="Diện tích (m²)"
            name="area"
            type="number"
            value={formData.area}
            onChange={handleInputChange}
            placeholder="Diện tích"
            required
            min="0"
          />
          <Input
            id="bedrooms"
            label="Số phòng ngủ"
            name="bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={handleInputChange}
            placeholder="Số PN"
            min="0"
          />
          <Input
            id="bathrooms"
            label="Số phòng tắm"
            name="bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={handleInputChange}
            placeholder="Số WC"
            min="0"
          />
        </div>

        <Input
          id="address"
          label="Địa chỉ chi tiết"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Số nhà, đường, phường/xã"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="district"
            label="Quận/Huyện"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            placeholder="Ví dụ: Quận 1"
            required
          />
          <Input
            id="city"
            label="Thành phố"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Ví dụ: Hồ Chí Minh"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="lat"
            label="Vĩ độ (Latitude)"
            name="lat"
            type="number"
            step="0.000001"
            value={formData.coords.lat}
            onChange={handleCoordsChange}
            placeholder="Ví dụ: 10.762622"
            required
          />
          <Input
            id="lng"
            label="Kinh độ (Longitude)"
            name="lng"
            type="number"
            step="0.000001"
            value={formData.coords.lng}
            onChange={handleCoordsChange}
            placeholder="Ví dụ: 106.660172"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">Hình ảnh</label>
          <input
            id="images"
            name="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview || DEFAULT_LISTING_IMAGE_URL}
                  alt={`Preview ${index}`}
                  className="w-full h-32 object-cover rounded-md border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FIX: Add required prop to Select components */}
        <Select
          id="status"
          label="Trạng thái tin rao"
          name="status"
          options={LISTING_STATUSES}
          value={formData.status}
          onChange={handleInputChange}
          required
        />

        <Button type="submit" loading={submitting} className="w-full mt-6">
          {id ? 'Cập nhật tin rao' : 'Đăng tin mới'}
        </Button>
      </form>
    </div>
  );
};

export default PostListing;