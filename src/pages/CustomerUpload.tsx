import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function CustomerUpload() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [songRequest, setSongRequest] = useState('');
  const [loading, setLoading] = useState(false);

  const MAX_VIDEO_SIZE = 3 * 1024 * 1024; // 3MB in bytes

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    let hasErrors = false;
    
    const validVideos = files.filter(file => {
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error(`Video "${file.name}" exceeds 3MB size limit`, {
          duration: 4000,
          icon: '⚠️'
        });
        hasErrors = true;
        return false;
      }
      return true;
    });

    if (hasErrors) {
      // Clear the input if there were any errors
      e.target.value = '';
    }

    setVideos(validVideos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (images.length === 0 && videos.length === 0) {
      toast.error('Please upload at least one image or video');
      return;
    }

    try {
      setLoading(true);

      // Check if order exists - fixed query
      const { data: existingOrders, error: queryError } = await supabase
        .from('orders')
        .select('id')
        .eq('order_id', orderId);

      if (queryError) throw queryError;

      if (existingOrders && existingOrders.length > 0) {
        toast.error('This order ID has already been used');
        return;
      }

      // Create new order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{ order_id: orderId, song_request: songRequest }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Upload all files
      const allFiles = [...images, ...videos];
      for (const file of allFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `customer-files/${order.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        await supabase.from('files').insert([
          {
            order_id: order.id,
            file_path: filePath,
            file_type: file.type,
          },
        ]);
      }

      navigate('/thank-you');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="https://i.ibb.co.com/9m0QB8kc/ARsthetic-02.png" 
              alt="ARsthetic Logo" 
              className="h-40 w-auto"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Upload Files</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your order ID and upload your files
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">
              Order ID
            </label>
            <input
              type="text"
              id="orderId"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-0.5 text-xs text-gray-400 italic">
              Contoh: 577633731543205864
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="h-5 w-5 text-indigo-600" />
                <label className="block text-sm font-medium text-gray-700">
                  Upload Images
                </label>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(Array.from(e.target.files || []))}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              <p className="mt-0.5 text-xs text-gray-400 italic">
                Gambar Gantungan Kunci
              </p>
              {images.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {images.length} image{images.length === 1 ? '' : 's'} selected
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-5 w-5 text-indigo-600" />
                <label className="block text-sm font-medium text-gray-700">
                  Upload Videos
                </label>
              </div>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleVideoChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              <p className="mt-0.5 text-xs text-gray-400 italic">Max video size: 3MB per video</p>
              {videos.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {videos.length} video{videos.length === 1 ? '' : 's'} selected
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="song" className="block text-sm font-medium text-gray-700">
              Song Request
            </label>
            <input
              type="text"
              id="song"
              required
              value={songRequest}
              onChange={(e) => setSongRequest(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-0.5 text-xs text-gray-400 italic">
              Contoh: Bernadya - Bulan
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Files'}
          </button>
        </form>
      </div>
    </div>
  );
}