import React, { useState } from 'react';
import { Send, Image as ImageIcon, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';


const CreateNotice = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notice_type: 'general',
    target_class: '',
    target_branch: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('PDF size should be less than 10MB');
        return;
      }
      setPdfFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const removePdf = () => {
    setPdfFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = null;
      let pdfUrl = null;

      // 1. Upload image if selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);

        const uploadRes = await fetch(`${API_URL}/notices/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadData
        });

        if (!uploadRes.ok) throw new Error('Failed to upload image');
        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.image_url;
      }

      // 2. Upload PDF if selected
      if (pdfFile) {
        const uploadData = new FormData();
        uploadData.append('file', pdfFile);

        const uploadRes = await fetch(`${API_URL}/notices/upload-pdf`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadData
        });

        if (!uploadRes.ok) throw new Error('Failed to upload PDF');
        const uploadJson = await uploadRes.json();
        pdfUrl = uploadJson.pdf_url;
      }

      // 3. Create Notice
      const noticePayload = { ...formData, image_url: imageUrl, pdf_url: pdfUrl };
      if (!noticePayload.target_class) delete noticePayload.target_class;
      if (!noticePayload.target_branch) delete noticePayload.target_branch;

      const response = await fetch(`${API_URL}/notices/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noticePayload)
      });

      if (!response.ok) throw new Error('Failed to create notice');

      toast.success('Notice Created Successfully!');
      navigate('/notices');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Notice</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Broadcast an announcement to students and staff.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notice Title</label>
            <input type="text" required className="mt-1 block w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea rows={4} required className="mt-1 block w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notice Photo <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span></label>
              {!imagePreview ? (
                <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors h-32">
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                      <span className="relative font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        Upload Image
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                  <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                </label>
              ) : (
                <div className="relative mt-2 inline-block h-32 w-full">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-md border border-gray-200 dark:border-gray-700" />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PDF Document <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span></label>
              {!pdfFile ? (
                <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors h-32">
                  <div className="space-y-1 text-center">
                    <FileText className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                      <span className="relative font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        Upload PDF
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">PDF up to 10MB</p>
                  </div>
                  <input type="file" className="sr-only" accept="application/pdf" onChange={handlePdfChange} />
                </label>
              ) : (
                <div className="mt-2 h-32 w-full border-2 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center justify-center relative">
                  <div className="text-center p-4">
                    <FileText className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{pdfFile.name}</p>
                  </div>
                  <button type="button" onClick={removePdf} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
                value={formData.notice_type} onChange={e => setFormData({...formData, notice_type: e.target.value})}>
                <option value="general">General</option>
                <option value="exam">Exam</option>
                <option value="event">Event</option>
                <option value="urgent">Urgent</option>
                <option value="holiday">Holiday</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Semester <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span></label>
              <select className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
                value={formData.target_class} onChange={e => setFormData({...formData, target_class: e.target.value})}>
                <option value="">All Semesters</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Branch <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span></label>
              <select className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
                value={formData.target_branch} onChange={e => setFormData({...formData, target_branch: e.target.value})}>
                <option value="">All Branches</option>
                <option value="CS">Computer Science (CS)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="MECH">Mechanical</option>
                <option value="CIVIL">Civil</option>
                <option value="EXTC">Electronics & Telecom</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Publishing...' : <><Send className="mr-2 -ml-1 h-4 w-4" /> Publish Notice</>}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateNotice;
