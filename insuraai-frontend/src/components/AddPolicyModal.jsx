import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, CloudUpload, Scan, Edit3, Calendar, DollarSign, Shield, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AddPolicyModal({ onClose, onSave, token }) {
  const [activeTab, setActiveTab] = useState("scan");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExtracted, setIsExtracted] = useState(false);

  const [formData, setFormData] = useState({
    policyNumber: "",
    type: "Health",
    premiumAmount: "",
    sumInsured: "",
    deductible: "",
    startDate: "",
    endDate: "",
  });

  // --- File Handler ---
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (
      selected &&
      ["image/jpeg", "image/png", "application/pdf"].includes(selected.type) &&
      selected.size <= 10 * 1024 * 1024
    ) {
      setFile(selected);
      setIsExtracted(false);
    } else {
      toast.error("Invalid file. Please upload JPG, PNG, or PDF under 10MB.");
    }
  };

  // --- Input Handler ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- AI Extraction Logic ---
  const handleExtract = async () => {
    if (!file) return toast.error("Please choose a file first.");
    setLoading(true);
    
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/extractRoutes/extract`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, 
        body: formDataObj,
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({
          policyNumber: data.policyNumber || "",
          type: data.type || "Health",
          premiumAmount: data.premiumAmount || "",
          sumInsured: data.sumInsured || "",
          deductible: data.deductible || "",
          startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "",
          endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "",
        });
        setIsExtracted(true);
        toast.success("Data extracted successfully!");
      } else {
        toast.error("Extraction failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to extraction service.");
    } finally {
      setLoading(false);
    }
  };
  const handleAddPolicy = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();
      
      Object.keys(formData).forEach((key) => {
        const value = formData[key] || ""; 
        formDataObj.append(key, value);
      });

      if (file && activeTab === 'scan') {
        formDataObj.append("file", file);
      }

      console.log("Sending Data..."); 

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/policies`, {
        method: "POST",
        headers: { 
            Authorization: `Bearer ${token}` 
            
        },
        body: formDataObj,
      });

      const result = await res.json();

      if (res.ok) {
        onSave(result); 
        onClose();
      } else {
        console.error("Server Error:", result);
        toast.error("Failed: " + (result.error || result.message || "Server rejected data"));
      }
    } catch (err) {
      console.error("Network Error:", err);
      toast.error("Network error while saving policy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Add New Policy</h3>
            <p className="text-xs text-gray-500">Select a method to add your insurance details</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-white border-b border-gray-100">
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === "scan"
                ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Scan size={18} /> AI Scan
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === "manual"
                ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Edit3 size={18} /> Manual Entry
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* --- SCAN TAB --- */}
          {activeTab === "scan" && (
            <div className="space-y-6">
              {/* Upload Box */}
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                file ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
              }`}>
                <input
                  type="file"
                  id="file-upload"
                  accept=".jpg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                   <div className={`p-3 rounded-full mb-3 ${file ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                      <CloudUpload size={32} />
                   </div>
                   {file ? (
                     <div>
                       <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                       <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                       <p className="text-xs text-indigo-600 mt-2 font-medium">Click to change</p>
                     </div>
                   ) : (
                     <div>
                       <p className="text-sm font-medium text-gray-700">Click to upload document</p>
                       <p className="text-xs text-gray-400 mt-1">PDF, JPG, or PNG (Max 10MB)</p>
                     </div>
                   )}
                </label>
              </div>

              {/* Actions */}
              {!isExtracted ? (
                 <button
                   onClick={handleExtract}
                   disabled={!file || loading}
                   className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                   {loading ? <Loader2 className="animate-spin" /> : <Scan size={18} />}
                   {loading ? "Extracting Data..." : "Extract Details with AI"}
                 </button>
              ) : (
                 // Extracted Preview
                 <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                       <div className="flex items-center gap-2 text-green-700 font-semibold mb-3">
                          <CheckCircle2 size={18} /> Extraction Complete
                       </div>
                       <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                          <p><span className="font-medium">Number:</span> {formData.policyNumber}</p>
                          <p><span className="font-medium">Type:</span> {formData.type}</p>
                          <p><span className="font-medium">Premium:</span> ₹{formData.premiumAmount}</p>
                          <p><span className="font-medium">Expiry:</span> {formData.endDate}</p>
                       </div>
                    </div>
                    <button
                      onClick={handleAddPolicy}
                      disabled={loading}
                      className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                      Confirm & Save Policy
                    </button>
                 </div>
              )}
            </div>
          )}

          {/* --- MANUAL TAB --- */}
          {activeTab === "manual" && (
             <form onSubmit={handleAddPolicy} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <InputGroup label="Policy Number" icon={<Shield size={14} />}>
                      <input name="policyNumber" required className="input-field" placeholder="POL-12345" onChange={handleChange} value={formData.policyNumber} />
                   </InputGroup>
                   <InputGroup label="Policy Type">
                      <select name="type" className="input-field bg-white" onChange={handleChange} value={formData.type}>
                         <option value="Health">Health</option>
                         <option value="Vehicle">Vehicle</option>
                         <option value="Life">Life</option>
                         <option value="Home">Home</option>
                         <option value="Travel">Travel</option>
                      </select>
                   </InputGroup>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <InputGroup label="Premium (₹)" icon={<DollarSign size={14} />}>
                      <input name="premiumAmount" type="number" required className="input-field" placeholder="0.00" onChange={handleChange} value={formData.premiumAmount} />
                   </InputGroup>
                   <InputGroup label="Sum Insured (₹)">
                      <input name="sumInsured" type="number" required className="input-field" placeholder="0.00" onChange={handleChange} value={formData.sumInsured} />
                   </InputGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <InputGroup label="Start Date" icon={<Calendar size={14} />}>
                      <input name="startDate" type="date" required className="input-field text-gray-500" onChange={handleChange} value={formData.startDate} />
                   </InputGroup>
                   <InputGroup label="End Date" icon={<Calendar size={14} />}>
                      <input name="endDate" type="date" required className="input-field text-gray-500" onChange={handleChange} value={formData.endDate} />
                   </InputGroup>
                </div>

                <div className="pt-4">
                   <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                      {loading ? <Loader2 className="animate-spin" /> : "Save Policy"}
                   </button>
                </div>
             </form>
          )}
        </div>
      </motion.div>

      <style>{`
        .input-field {
           width: 100%;
           padding: 0.6rem 0.75rem;
           border: 1px solid #e5e7eb;
           border-radius: 0.5rem;
           font-size: 0.875rem;
           outline: none;
           transition: border-color 0.2s;
        }
        .input-field:focus {
           border-color: #6366f1;
           box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
}

// Helper Component
function InputGroup({ label, icon, children }) {
   return (
      <div className="space-y-1.5">
         <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
            {icon} {label}
         </label>
         {children}
      </div>
   )
}