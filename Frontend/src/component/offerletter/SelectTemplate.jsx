import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Pen, 
  Briefcase, 
  User, 
  Calendar, 
  Clock, 
  ArrowRight,
  X
} from 'lucide-react';
import DefaultBlue from '../../assets/offerletterimg/offerletertemplate2/Default/Blue.png';
import DefaultDarkBlue from '../../assets/offerletterimg/offerletertemplate2/Default/DarkBlue.png';
import DefaultLightgreen from '../../assets/offerletterimg/offerletertemplate2/Default/Lightgreen.png';
import DefaultPink from '../../assets/offerletterimg/offerletertemplate2/Default/Pink.png';
import DefaultPurple from '../../assets/offerletterimg/offerletertemplate2/Default/Purple.png';

import Cust1Blue from '../../assets/offerletterimg/offerletertemplate2/Customize1/blue.png';
import Cust1DarkBlue from '../../assets/offerletterimg/offerletertemplate2/Customize1/Darkblue.png';
import Cust1Lightgreen from '../../assets/offerletterimg/offerletertemplate2/Customize1/Lightgreen.png';
import Cust1Pink from '../../assets/offerletterimg/offerletertemplate2/Customize1/Pink.png';
import Cust1Purple from '../../assets/offerletterimg/offerletertemplate2/Customize1/Purple.png';

import Cust2DarkBlue from '../../assets/offerletterimg/offerletertemplate2/Customize2/Darkblue.png';
import Cust2Pink from '../../assets/offerletterimg/offerletertemplate2/Customize2/Pink.png';
import Cust2Purple from '../../assets/offerletterimg/offerletertemplate2/Customize2/Purple.png';
import Cust2Blue from '../../assets/offerletterimg/offerletertemplate2/Customize2/blur.png';
import Cust2Lightgreen from '../../assets/offerletterimg/offerletertemplate2/Customize2/lightgreen.png';

import OfferLetterStepper from './OfferLetterStepper';

const templateImages = {
  default: {
    blue: DefaultBlue,
    darkblue: DefaultDarkBlue,
    lightgreen: DefaultLightgreen,
    pink: DefaultPink,
    purple: DefaultPurple
  },
  customize1: {
    blue: Cust1Blue,
    darkblue: Cust1DarkBlue,
    lightgreen: Cust1Lightgreen,
    pink: Cust1Pink,
    purple: Cust1Purple
  },
  customize2: {
    blue: Cust2Blue,
    darkblue: Cust2DarkBlue,
    lightgreen: Cust2Lightgreen,
    pink: Cust2Pink,
    purple: Cust2Purple
  }
};

const colors = [
  { id: 'blue', label: 'Blue', code: '#3b82f6' },
  { id: 'darkblue', label: 'Dark Blue', code: '#1e3a8a' },
  { id: 'lightgreen', label: 'Light Green', code: '#86efac' },
  { id: 'pink', label: 'Pink', code: '#f9a8d4' },
  { id: 'purple', label: 'Purple', code: '#a855f7' }
];

/**
 * SelectTemplate (UI Component)
 * Focused on rendering the Step 1 Template & Theme Selection layout:
 * - Color theme selector chips
 * - Template cards (Default, Customize 1, Customize 2)
 * - Candidate profile summary card
 * - Full-screen template preview modal
 */
const SelectTemplate = ({
  status: propStatus,
  jobId: propJobId,
  candidate: propCandidate,
  jobDescription,
  selectedTemplate: propSelectedTemplate,
  onSelectTemplate: propOnSelectTemplate,
  selectedColor: propSelectedColor,
  onSelectColor: propOnSelectColor,
  previewModal: propPreviewModal,
  onOpenPreview: propOnOpenPreview,
  onClosePreview: propOnClosePreview,
  getInitials: propGetInitials,
  formatInterviewDate: propFormatInterviewDate,
  onBack: propOnBack,
  onProceed: propOnProceed,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const status = propStatus !== undefined ? propStatus : state.status;
  const jobId = propJobId !== undefined ? propJobId : state.jobId;
  const candidate = propCandidate !== undefined ? propCandidate : state.candidate;

  // Local state fallbacks for standalone usage
  const [localTemplate, setLocalTemplate] = useState('default');
  const [localColor, setLocalColor] = useState('blue');
  const [localPreviewModal, setLocalPreviewModal] = useState({ isOpen: false, img: null, title: '' });

  const selectedTemplate = propSelectedTemplate !== undefined ? propSelectedTemplate : localTemplate;
  const setSelectedTemplate = propOnSelectTemplate || setLocalTemplate;

  const selectedColor = propSelectedColor !== undefined ? propSelectedColor : localColor;
  const setSelectedColor = propOnSelectColor || setLocalColor;

  const previewModal = propPreviewModal !== undefined ? propPreviewModal : localPreviewModal;
  const openPreview = propOnOpenPreview || ((img, title) => setLocalPreviewModal({ isOpen: true, img, title }));
  const closePreview = propOnClosePreview || (() => setLocalPreviewModal({ isOpen: false, img: null, title: '' }));

  // Fallback candidate initials
  const getInitials = propGetInitials || ((name) => {
    if (!name) return '??';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2);
  });

  // Fallback interview date formatting
  const formatInterviewDate = propFormatInterviewDate || ((date, time) => {
    if (!date) return 'Not Scheduled';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Not Scheduled';
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'Not Scheduled';
    }
  });

  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      navigate('/viewApplicants', { state: { status, jobId, tab: 'Hired' } });
    }
  };

  const handleProceed = () => {
    const payload = { jobId, status, candidate, selectedTemplate, selectedColor };
    if (propOnProceed) {
      propOnProceed(payload);
    } else {
      navigate('/offerletter', { state: payload });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          type="button"
          onClick={handleBack}
          className="p-1 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          title="Back to candidates"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-3xl font-bold text-[#1e3a8a]">Send Offer Letter</h1>
      </div>

      {/* Stepper */}
      <OfferLetterStepper currentStep={1} />

      {/* Main Content Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* Left Column: Template Selection (Spans 7 cols) */}
          <div className="xl:col-span-7">
            <h2 className="text-xl font-semibold mb-1 text-slate-900">Select Template</h2>
            <p className="text-gray-500 mb-6 text-sm">Choose how you want to create the offer letter</p>

            {/* Color Selection */}
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3 text-slate-800">Select Theme Color</h3>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer ${
                      selectedColor === c.id 
                        ? 'border-blue-500 bg-blue-50/50 shadow-[0_2px_10px_rgba(59,130,246,0.15)] ring-1 ring-blue-500' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full shadow-inner border border-black/10"
                      style={{ backgroundColor: c.code }}
                    />
                    <span className={`text-sm font-medium ${selectedColor === c.id ? 'text-blue-700' : 'text-slate-600'}`}>
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Variant Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Default Template Card */}
              <div 
                className={`rounded-xl p-6 relative cursor-pointer bg-white transition-colors ${
                  selectedTemplate === 'default' 
                    ? 'border-2 border-blue-500' 
                    : 'border border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate('default')}
              >
                <input 
                  type="radio" 
                  name="template" 
                  className="absolute top-4 left-4 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" 
                  checked={selectedTemplate === 'default'}
                  onChange={() => setSelectedTemplate('default')}
                />
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-center font-medium text-slate-800 mb-1">Default Template</h3>
                <p className="text-center text-sm text-gray-500 px-2 leading-relaxed">
                  Use our standard offer letter template
                </p>
              </div>

              {/* Customize Template Card */}
              <div 
                className={`rounded-xl p-6 relative cursor-pointer bg-white transition-colors ${
                  selectedTemplate.startsWith('customize') 
                    ? 'border-2 border-blue-500' 
                    : 'border border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate('customize1')}
              >
                <input 
                  type="radio" 
                  name="template" 
                  className="absolute top-4 left-4 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" 
                  checked={selectedTemplate.startsWith('customize')}
                  onChange={() => setSelectedTemplate('customize1')}
                />
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <Pen className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-center font-medium text-slate-800 mb-1">Customize template</h3>
                <p className="text-center text-sm text-gray-500 px-2 leading-relaxed">
                  Create a custom offer letter template
                </p>
              </div>
            </div>

            {/* Template Preview Section */}
            {selectedTemplate === 'default' ? (
              <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-[0_0_15px_rgba(0,0,0,0.03)]">
                <h3 className="text-sm font-medium mb-4 text-slate-800">Template preview</h3>
                <div className="bg-[#f0f4fc] rounded-lg p-5 flex gap-6 items-center">
                  <div 
                    className="w-20 h-28 bg-white shadow-sm border border-gray-200 rounded shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                    onClick={() => openPreview(templateImages.default[selectedColor], 'Default Template')}
                  >
                    <img 
                      src={templateImages.default[selectedColor]} 
                      alt="Template Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <h4 className="font-semibold text-slate-900 mb-1">Default Template</h4>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      Professional offer letter template with standard terms and conditions
                    </p>
                    <button 
                      type="button"
                      onClick={() => openPreview(templateImages.default[selectedColor], 'Default Template')}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Preview Template
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Customize Template 1 */}
                <div 
                  className={`border rounded-xl p-6 bg-white shadow-[0_0_15px_rgba(0,0,0,0.03)] cursor-pointer transition-all ${
                    selectedTemplate === 'customize1' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'
                  }`}
                  onClick={() => setSelectedTemplate('customize1')}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-slate-800">Template preview</h3>
                    <input 
                      type="radio" 
                      name="subTemplate" 
                      checked={selectedTemplate === 'customize1'}
                      onChange={() => setSelectedTemplate('customize1')}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                  </div>
                  <div className="bg-[#f0f4fc] rounded-lg p-5 flex gap-6 items-center">
                    <div 
                      className="w-20 h-28 bg-white shadow-sm border border-gray-200 rounded shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(templateImages.customize1[selectedColor], 'Customize Template 1');
                      }}
                    >
                      <img 
                        src={templateImages.customize1[selectedColor]} 
                        alt="Template Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <h4 className="font-semibold text-slate-900 mb-1">Customize Template 1</h4>
                      <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                        Professional offer letter template with standard terms and conditions
                      </p>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(templateImages.customize1[selectedColor], 'Customize Template 1');
                        }}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Preview Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customize Template 2 */}
                <div 
                  className={`border rounded-xl p-6 bg-white shadow-[0_0_15px_rgba(0,0,0,0.03)] cursor-pointer transition-all ${
                    selectedTemplate === 'customize2' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'
                  }`}
                  onClick={() => setSelectedTemplate('customize2')}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-slate-800">Template preview</h3>
                    <input 
                      type="radio" 
                      name="subTemplate" 
                      checked={selectedTemplate === 'customize2'}
                      onChange={() => setSelectedTemplate('customize2')}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                  </div>
                  <div className="bg-[#f0f4fc] rounded-lg p-5 flex gap-6 items-center">
                    <div 
                      className="w-20 h-28 bg-white shadow-sm border border-gray-200 rounded shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(templateImages.customize2[selectedColor], 'Customize Template 2');
                      }}
                    >
                      <img 
                        src={templateImages.customize2[selectedColor]} 
                        alt="Template Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <h4 className="font-semibold text-slate-900 mb-1">Customize Template 2</h4>
                      <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                        Professional offer letter template with standard terms and conditions
                      </p>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(templateImages.customize2[selectedColor], 'Customize Template 2');
                        }}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Preview Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Selected Candidate (Spans 5 cols) */}
          <div className="xl:col-span-5">
            <h2 className="text-lg font-medium mb-4 text-slate-900">Selected Candidate</h2>
            
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
              {/* Candidate Header */}
              <div className="bg-[#f0f4fc] p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#0052cc] text-white flex items-center justify-center text-2xl font-semibold shrink-0">
                  {getInitials(candidate?.name)}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-slate-900 mb-1">
                    {candidate?.name || 'Unknown Candidate'}
                  </h3>
                  <p className="text-gray-500 text-sm mb-0.5">
                    {candidate?.email || candidate?.candidate?.email || 'N/A'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {candidate?.contactNumber || candidate?.mobile || candidate?.candidate?.mobile || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Candidate Details */}
              <div className="p-6 flex flex-col gap-5">
                <div className="grid grid-cols-[140px_1fr] items-center">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm">Position</span>
                  </div>
                  <span className="text-sm text-slate-800 font-medium">
                    {jobDescription?.jobTitle || candidate?.jobDetails?.jobTitle || candidate?.position || 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-[140px_1fr] items-center">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Department</span>
                  </div>
                  <span className="text-sm text-slate-800 font-medium">
                    {jobDescription?.department || candidate?.jobDetails?.department || candidate?.department || 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-[140px_1fr] items-center">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Interview date</span>
                  </div>
                  <span className="text-sm text-slate-800 font-medium">
                    {formatInterviewDate(
                      candidate?.interviewDate || candidate?.interviewSchedule?.interviewDate,
                      candidate?.interviewTime || candidate?.interviewSchedule?.interviewTime
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-[140px_1fr] items-center">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Status</span>
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded capitalize">
                      {candidate?.profileStatus || candidate?.status || 'Hired'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Action */}
      <div className="max-w-7xl mx-auto mt-6 flex justify-end">
        <button 
          type="button"
          onClick={handleProceed}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors cursor-pointer"
        >
          Next: Candidate Details
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
              <h3 className="font-bold text-slate-800">
                {previewModal.title} Preview
              </h3>
              <button 
                type="button"
                onClick={closePreview}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            {/* Modal Body - Image Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex justify-center">
              <img 
                src={previewModal.img} 
                alt="Template Full View" 
                className="max-w-full h-[1000px] shadow-lg rounded-sm"
              />
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button 
                type="button"
                onClick={closePreview}
                className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button 
                type="button"
                onClick={() => {
                  closePreview();
                  handleProceed();
                }}
                className="px-6 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                Use this template
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default SelectTemplate;
