import React, { useState } from "react";
import { motion } from "framer-motion";
import { CloudUpload } from "lucide-react";

export default function AddPolicyModal({ onClose, onSave, token }) {
  const [activeTab, setActiveTab] = useState("scan");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    policyNumber: "",
    type: "",
    premiumAmount: "",
    sumInsured: "",
    deductible: "",
    startDate: "",
    endDate: "",
  });
  // File select
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (
      selected &&
      ["image/jpeg", "image/png", "application/pdf"].includes(selected.type) &&
      selected.size <= 10 * 1024 * 1024
    ) {
      setFile(selected);
    } else {
      alert("❌ Invalid file. Please upload JPG, PNG, or PDF under 10MB.");
    }
  };

  // Run AI extraction
  const handleExtract = async () => {
    if (!file) return alert("Please choose a file first.");
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
          type: data.type || "",
          premiumAmount: data.premiumAmount || "",
          sumInsured: data.sumInsured || "",
          deductible: data.deductible || "",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
        });
      } else {
        alert("❌ Extraction failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("❌ Error connecting to backend.");
    }
    setLoading(false);
  };

  // Add policy with file upload support
  const handleAddPolicy = async () => {
    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });
    if (file) formDataObj.append("file", file);

    console.log("📤 Sending policy data (multipart):", Object.fromEntries(formDataObj));

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/policies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });

      const result = await res.json();
      console.log("📥 Backend response:", result);

      if (res.ok) {
        if (result.duplicate) {
          console.log("ℹ️ Duplicate detected, ignoring.");
          onClose(); // just close modal, don’t re-add
        } else {
          onSave(result); // ✅ normal add
          onClose();
        }
      } else {
        alert("❌ Failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("❌ Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-indigo-600 mb-1">Add New Policy</h2>
          <p className="text-gray-500 text-sm">
            Upload a policy document to automatically extract details, or enter them manually.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button
              className={`flex-1 py-2 ${
                activeTab === "scan"
                  ? "border-b-2 border-indigo-600 text-indigo-600 font-semibold"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("scan")}
            >
              Scan Document
            </button>
            <button
              className={`flex-1 py-2 ${
                activeTab === "manual"
                  ? "border-b-2 border-indigo-600 text-indigo-600 font-semibold"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("manual")}
            >
              Manual Entry
            </button>
          </div>

          {/* Scan Tab */}
          {activeTab === "scan" && (
            <div className="text-center">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                <CloudUpload className="mx-auto text-gray-400 w-12 h-12 mb-2" />
                <p className="text-gray-600">Drag & drop file here, or</p>
                <label className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700">
                  Choose File
                  <input
                    type="file"
                    accept=".jpg,.png,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {file && <p className="mt-2 text-sm text-gray-600">📄 {file.name}</p>}
              </div>

              {/* Info */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4 text-sm text-indigo-700">
                <p>
                  Our AI will automatically extract <b>policy number</b>, <b>type</b>, <b>premium amount</b>, <b>sum insured</b>, <b>deductible</b>, and dates.
                  You can review details below.
                </p>
              </div>

              {/* Extraction or Preview */}
              {!formData.policyNumber && !formData.type && !formData.startDate ? (
                <button
                  disabled={!file || loading}
                  onClick={handleExtract}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {loading ? "⏳ Extracting..." : "Run AI Extraction"}
                </button>
              ) : (
                <>
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-left">
                    <h4 className="font-semibold text-green-700 mb-2">Extracted Details:</h4>
                    <p><b>Policy Number:</b> {formData.policyNumber || "-"}</p>
                    <p><b>Type:</b> {formData.type || "-"}</p>
                    <p><b>Premium:</b> ₹{formData.premiumAmount || "-"}</p>
                    <p><b>Sum Insured:</b> ₹{formData.sumInsured || "-"}</p>
                    <p><b>Deductible:</b> ₹{formData.deductible || "-"}</p>
                    <p><b>Start Date:</b> {formData.startDate || "-"}</p>
                    <p><b>End Date:</b> {formData.endDate || "-"}</p>
                  </div>

                  <button
                    onClick={handleAddPolicy}
                    disabled={loading}
                    className={`w-full mt-4 px-6 py-3 rounded-lg text-white ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {loading ? "⏳ Saving..." : "➕ Add Policy"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Manual Tab */}
          {activeTab === "manual" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddPolicy();
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Policy Number"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Type"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Premium Amount"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.premiumAmount}
                onChange={(e) => setFormData({ ...formData, premiumAmount: e.target.value })}
              />
              <input
                type="number"
                placeholder="Sum Insured"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.sumInsured}
                onChange={(e) => setFormData({ ...formData, sumInsured: e.target.value })}
              />
              <input
                type="number"
                placeholder="Deductible"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.deductible}
                onChange={(e) => setFormData({ ...formData, deductible: e.target.value })}
              />
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg text-white ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? "⏳ Saving..." : "Save Policy"}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
