import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  order_id: string;
  song_request: string;
  status: string;
  created_at: string;
  files: {
    id: string;
    file_path: string;
    file_type: string;
  }[];
}

export default function SellerDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async (search?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select(`
          *,
          files (
            id,
            file_path,
            file_type
          )
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('order_id', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchTerm);
  };

  const handleDownload = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('media')
        .createSignedUrl(filePath, 60); // URL valid for 60 seconds

      if (error) throw error;
      
      if (!data.signedUrl) {
        throw new Error('Failed to generate download URL');
      }

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = filePath.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order deleted successfully');
      fetchOrders(searchTerm);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage customer orders and files
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by Order ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Order ID: {order.order_id}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Song Request: {order.song_request}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Status: {order.status}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Created: {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="ml-4 text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {order.files && order.files.length > 0 ? (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">Files:</h4>
                      <ul className="mt-2 divide-y divide-gray-200">
                        {order.files.map((file) => (
                          <li
                            key={file.id}
                            className="py-2 flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-500">
                              {file.file_path.split('/').pop()}
                            </span>
                            <button
                              onClick={() => handleDownload(file.file_path)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">No files uploaded</p>
                  )}
                </li>
              ))}
              {orders.length === 0 && (
                <li className="p-6 text-center text-gray-500">No orders found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}