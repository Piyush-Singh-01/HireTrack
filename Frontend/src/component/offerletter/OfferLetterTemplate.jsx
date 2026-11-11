import React, { useRef } from 'react';
import JoiningInstructionsModal from '../position/candidatePage/JoiningInstructionsModal';
import { ClipboardList } from 'lucide-react';

import DefaultBlue from '../../assets/offerletterimg/offerletertemplate2/Default/Blue.png';
import DefaultDarkBlue from '../../assets/offerletterimg/offerletertemplate2/Default/DarkBlue.png';
import DefaultLightgreen from '../../assets/offerletterimg/offerletertemplate2/Default/Lightgreen.png';
import DefaultPink from '../../assets/offerletterimg/offerletertemplate2/Default/Pink.png';
import DefaultPurple from '../../assets/offerletterimg/offerletertemplate2/Default/Purple.png';

const templateImages = {
  blue: DefaultBlue,
  darkblue: DefaultDarkBlue,
  lightgreen: DefaultLightgreen,
  pink: DefaultPink,
  purple: DefaultPurple
};

const colors = [
  { id: 'blue', label: 'Blue', code: '#3b82f6' },
  { id: 'darkblue', label: 'Dark Blue', code: '#1e3a8a' },
  { id: 'lightgreen', label: 'Light Green', code: '#86efac' },
  { id: 'pink', label: 'Pink', code: '#f9a8d4' },
  { id: 'purple', label: 'Purple', code: '#a855f7' }
];

/**
 * OfferLetterTemplate (UI Component)
 * Focused on rendering the Default Offer Letter Template editor layout:
 * - 1. Company Details (name, address, website, logo)
 * - 2. Greeting & Candidate Defaults
 * - 3. Terms & Conditions
 * - 4. Compensation
 * - 5. Responsibilities
 * - 6. Notice & Closing Note
 * - 7. Signature & PDF Agreement
 * - 8. Theme Color Selection & Template Swatch Preview
 * - 9. Onboarding Details Modal
 * - Action button ("Save Template")
 */
const OfferLetterTemplate = ({
  jobId,
  formData = {},
  logo = null,
  isTemplateLoading = false,
  jobDetails = {},
  isSaving = false,
  isInstructionsModalOpen = false,
  setIsInstructionsModalOpen = () => {},
  refetchJobDetails,
  onChange = () => {},
  onColorSelect = () => {},
  onLogoChange = () => {},
  onRemoveLogo = () => {},
  onSignatureChange = () => {},
  onRemoveSignature = () => {},
  onAgreementChange = () => {},
  onRemoveAgreement = () => {},
  onSaveTemplate = () => {},
  onBack = () => {},
}) => {
  const fileInputRef = useRef(null);
  const signatureInputRef = useRef(null);
  const agreementInputRef = useRef(null);

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerSignatureInput = () => signatureInputRef.current?.click();
  const triggerAgreementInput = () => agreementInputRef.current?.click();

  if (isTemplateLoading) {
    return <div className="p-8 text-center text-gray-500">Loading offer letter template...</div>;
  }

  const selectedColor = formData.selectedColor || 'blue';
  const previewImage = templateImages[selectedColor] || templateImages.blue;

  return (
    <div className="bg-white font-sans text-gray-800 px-6 py-2 lg:px-8 lg:py-2">
      
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <button 
            type="button"
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Go Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#1e293b]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-[28px] font-bold text-[#2A3B5C]">Offer Letter Template</h1>
        </div>
        <h2 className="text-2xl text-[#2A3B5C] mb-1">Offer Letter Input</h2>
        <p className="text-gray-500 text-sm">Fill in details to generate the offer letter</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
        
        {/* Left Form Content */}
        <div className="flex-1 max-w-3xl pb-24">
          
          {/* 1. Company Details */}
          <div className="mb-8">
            <h3 className="text-blue-600 font-semibold text-lg mb-4">1. Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    name="companyName"
                    value={formData.companyName || ''}
                    onChange={onChange}
                    placeholder="TECHJOSE" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Company Address</label>
                  <textarea 
                    name="companyAddress"
                    value={formData.companyAddress || ''}
                    onChange={onChange}
                    placeholder="Company Address" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm h-[100px] resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 leading-relaxed"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Website</label>
                  <input 
                    type="text" 
                    name="website"
                    value={formData.website || ''}
                    onChange={onChange}
                    placeholder="www.techjose.com" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Logo</label>
                <div className="bg-[#3b4c6b] rounded-xl h-[11vw] min-h-[140px] flex flex-col items-center justify-center relative mt-1 overflow-hidden group">
                  {logo ? (
                    <img src={logo} alt="Company Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center text-white">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-1 text-gray-300">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                       </svg>
                       <span className="text-xs font-medium text-gray-300">No Logo Uploaded</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={onLogoChange} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </div>
                <div className="flex justify-center mt-3 gap-2">
                  <button 
                    type="button"
                    onClick={triggerFileInput}
                    className="bg-white text-[#3b4c6b] border border-gray-300 text-xs font-semibold px-5 py-2 rounded-md shadow-sm transition-all hover:bg-gray-50 active:scale-95 cursor-pointer"
                  >
                    {logo ? "Change Logo" : "Upload Logo"}
                  </button>
                  {logo && (
                    <button
                      type="button"
                      onClick={onRemoveLogo}
                      className="text-red-500 border border-red-200 text-xs font-semibold px-3 py-2 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Recommended size: 300 × 100px</p>
              </div>
            </div>
          </div>

          {/* 2. Greeting */}
          <div className="mb-8">
            <h3 className="text-blue-600 font-semibold text-lg mb-4">2. Greeting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Salutation</label>
                 <input 
                  type="text" 
                  name="salutation"
                  value={formData.salutation || 'Dear'}
                  onChange={onChange}
                  placeholder="Dear" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Candidate Name (Placeholder)</label>
                <input 
                  type="text" 
                  name="candidateName"
                  value={formData.candidateName || ''}
                  onChange={onChange}
                  placeholder="[Candidate Name]" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Intro Paragraph</label>
               <textarea 
                name="introParagraph"
                value={formData.introParagraph || ''}
                onChange={onChange}
                placeholder="Intro Paragraph"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm min-h-[80px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 leading-relaxed outline-none resize-y" 
              />
            </div>
          </div>

          {/* 3. Candidate Details */}
          <div className="mb-8">
            <h3 className="text-blue-600 font-semibold text-lg mb-4">3. Candidate Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Candidate Name<span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="candidateName"
                  value={formData.candidateName || ''}
                  onChange={onChange}
                  placeholder="[Candidate Name]" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                   <input 
                    type="date" 
                    name="date"
                    value={formData.date || ''}
                    onChange={onChange}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Details */}
          <div className="mb-8">
            <div className="flex items-center gap-6 mb-4">
              <h3 className="text-blue-600 font-semibold text-lg">4. Details</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="employmentType"
                    value="Internship"
                    checked={formData.employmentType === 'Internship'}
                    onChange={onChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Internship Details</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="employmentType"
                    value="Employee"
                    checked={formData.employmentType === 'Employee'}
                    onChange={onChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Employee Details</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Position / Role<span className="text-red-500">*</span></label>
                 <input 
                  type="text" 
                  name="position"
                  value={formData.position || ''}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Duration<span className="text-red-500">*</span></label>
                {formData.employmentType === 'Employee' ? (
                  <input 
                    type="text" 
                    name="duration"
                    value={formData.duration || ''}
                    onChange={onChange}
                    placeholder="e.g. Full-time"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                  />
                ) : (
                  <>
                    <div className="relative">
                      <select 
                        name="durationSelect"
                        value={['3 months', '6 months', '1 year'].includes(formData.duration) ? formData.duration : 'Others'}
                        onChange={(e) => {
                          const val = e.target.value === 'Others' ? '' : e.target.value;
                          onChange({ target: { name: 'duration', value: val } });
                        }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="3 months">3 months</option>
                        <option value="6 months">6 months</option>
                        <option value="1 year">1 year</option>
                        <option value="Others">Others</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    {!['3 months', '6 months', '1 year'].includes(formData.duration) && (
                      <div className="mt-2">
                        <input 
                          type="text" 
                          name="duration"
                          value={formData.duration || ''}
                          onChange={onChange}
                          placeholder="e.g. 6 months or 1 year" 
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                   <input 
                    type="date" 
                    name="startDate"
                    value={formData.startDate || ''}
                    onChange={onChange}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
              {formData.employmentType !== 'Employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
                   <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                     <input 
                      type="date" 
                      name="endDate"
                      value={formData.endDate || ''}
                      onChange={onChange}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Notice Period</label>
                <div className="relative">
                  <select 
                    name="noticePeriodSelect"
                    value={['5 Working Days', '10 Working Days', '15 Working Days'].includes(formData.noticePeriod) ? formData.noticePeriod : 'Others'}
                    onChange={(e) => {
                      const val = e.target.value === 'Others' ? '' : e.target.value;
                      onChange({ target: { name: 'noticePeriod', value: val } });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="5 Working Days">5 Working Days</option>
                    <option value="10 Working Days">10 Working Days</option>
                    <option value="15 Working Days">15 Working Days</option>
                    <option value="Others">Others</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {!['5 Working Days', '10 Working Days', '15 Working Days'].includes(formData.noticePeriod) && (
                  <div className="mt-2">
                    <input 
                      type="text" 
                      name="noticePeriod"
                      value={formData.noticePeriod || ''}
                      onChange={onChange}
                      placeholder="Enter number (Working Days will remain same)" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                )}
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Location</label>
                <div className="relative">
                  <select 
                    name="location"
                    value={formData.location || 'Remote'}
                    onChange={onChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option>Remote</option>
                    <option>On-site</option>
                    <option>Hybrid</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  {formData.employmentType === 'Employee' ? 'Salary' : 'Stipend'}
                </label>
                {formData.employmentType === 'Employee' ? (
                  <input 
                    type="text" 
                    name="salary"
                    value={formData.salary || ''}
                    onChange={onChange}
                    placeholder="e.g. 500000 or ₹5,00,000/month" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                  />
                ) : (
                  <>
                    <div className="relative">
                      <select 
                        name="stipendSelect"
                        value={formData.stipend === 'Unpaid Internship' ? 'Unpaid Internship' : 'Paid Internship'}
                        onChange={(e) => {
                          const val = e.target.value === 'Unpaid Internship' ? 'Unpaid Internship' : '';
                          onChange({ target: { name: 'stipend', value: val } });
                        }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        <option value="Unpaid Internship">Unpaid Internship</option>
                        <option value="Paid Internship">Paid Internship</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    {formData.stipend !== 'Unpaid Internship' && (
                      <div className="mt-2">
                        <input 
                          type="text" 
                          name="stipend"
                          value={formData.stipend || ''}
                          onChange={onChange}
                          placeholder="e.g. 5000 or ₹5,000/month" 
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 5. Responsibilities */}
          <div className="mb-8">
             <h3 className="text-blue-600 font-semibold text-lg mb-4">5. Responsibilities</h3>
             <div className="relative">
               <textarea 
                 name="responsibilities"
                 value={formData.responsibilities || ''}
                 onChange={onChange}
                 className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm min-h-[160px] resize-y focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 leading-relaxed pb-8"
               />
             </div>
          </div>

          {/* 6. Notice */}
          <div className="mb-8">
             <h3 className="text-blue-600 font-semibold text-lg mb-4">6. Notice</h3>
             <div className="relative">
               <textarea 
                 name="notice"
                 value={formData.notice || ''}
                 onChange={onChange}
                 className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 leading-relaxed pb-8"
               />
             </div>
          </div>

          {/* 7. Closing Note */}
          <div className="mb-8">
             <h3 className="text-blue-600 font-semibold text-lg mb-4">7. Closing Note</h3>
             <div className="relative">
               <textarea 
                 name="closingNote"
                 value={formData.closingNote || ''}
                 onChange={onChange}
                 className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 leading-relaxed pb-8"
               />
             </div>
          </div>

          {/* 8. Signature */}
          <div className="mb-8">
             <h3 className="text-blue-600 font-semibold text-lg mb-4">8. Signature</h3>
             <div className="flex flex-col items-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                {formData.signature ? (
                  <img src={formData.signature} alt="Signature" className="max-h-24 object-contain mb-4" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    <span className="text-sm">No Signature Uploaded</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={signatureInputRef} 
                  onChange={onSignatureChange} 
                  className="hidden" 
                  accept="image/*" 
                />
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={triggerSignatureInput}
                    className="bg-white text-blue-600 border border-blue-600 text-xs font-semibold px-4 py-2 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    {formData.signature ? "Change Signature" : "Upload Signature"}
                  </button>
                  {formData.signature && (
                    <button
                      type="button"
                      onClick={onRemoveSignature}
                      className="text-red-500 border border-red-200 text-xs font-semibold px-3 py-2 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
             </div>
          </div>

          {/* 9. Agreement */}
          <div className="mb-8">
             <h3 className="text-blue-600 font-semibold text-lg mb-4">9. Agreement (Optional)</h3>
             <div className="flex flex-col items-center p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                {formData.agreement ? (
                  <div className="flex flex-col items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Agreement Attached</span>
                    <p className="text-xs text-gray-500 mt-1">PDF File uploaded</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-16.5H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-sm">No Agreement Uploaded</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={agreementInputRef} 
                  onChange={onAgreementChange} 
                  className="hidden" 
                  accept=".pdf" 
                />
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={triggerAgreementInput}
                    className="bg-white text-blue-600 border border-blue-600 text-xs font-semibold px-6 py-2 rounded-md hover:bg-blue-50 transition-colors shadow-sm cursor-pointer"
                  >
                    {formData.agreement ? "Change Agreement" : "Upload Agreement (PDF)"}
                  </button>
                  {formData.agreement && (
                    <button
                      type="button"
                      onClick={onRemoveAgreement}
                      className="text-red-500 border border-red-200 text-xs font-semibold px-3 py-2 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
             </div>
          </div>

          {/* 10. Onboarding Details */}
          <div className="mb-8">
             <h3 className="text-blue-600 font-semibold text-lg mb-4">10. Onboarding Details</h3>
             <div className="flex flex-col items-center p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="flex flex-col items-center mb-4 text-center">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-3">
                    <ClipboardList size={32} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {jobDetails?.joiningInstructions ? "Onboarding Details Configured" : "Onboarding Details Missing"}
                  </span>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    {jobDetails?.joiningInstructions 
                      ? "These details will be sent to the candidate upon hiring." 
                      : "These are mandatory before sending an offer letter."}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsInstructionsModalOpen(true)}
                  className="bg-white text-blue-600 border border-blue-600 text-xs font-semibold px-6 py-2 rounded-md hover:bg-blue-50 transition-colors shadow-sm cursor-pointer"
                >
                  {jobDetails?.joiningInstructions ? "Edit Onboarding Details" : "Create Onboarding Details"}
                </button>
             </div>
          </div>

        </div>

        {/* Right Preview Content */}
        <div className="hidden lg:flex flex-col items-center w-[30vw] xl:w-[30vw]">
          <div className="sticky top-12 w-full flex flex-col items-center gap-6">
            
            {/* Color Selection */}
            <div className="w-full bg-white border border-gray-100 p-6 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.03)]">
              <h3 className="text-sm font-semibold mb-4 text-slate-800">Select Theme Color</h3>
              <div className="flex flex-wrap gap-3 justify-start">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onColorSelect(c.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      selectedColor === c.id 
                        ? 'border-blue-500 bg-blue-50/50 shadow-[0_2px_10px_rgba(59,130,246,0.15)] ring-1 ring-blue-500' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full shadow-inner border border-black/10"
                      style={{ backgroundColor: c.code }}
                    />
                    <span className={`text-xs font-medium ${selectedColor === c.id ? 'text-blue-700' : 'text-slate-600'}`}>
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Preview */}
            <div className="w-full bg-[#f0f4fc] rounded-xl p-6 flex flex-col items-center shadow-inner border border-gray-100">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 w-full text-left">Default Template Preview</h3>
              <div className="w-[80%] max-w-[280px] bg-white shadow-lg border border-gray-200 rounded-md overflow-hidden">
                <img 
                  src={previewImage} 
                  alt="Template Preview" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-end items-center pt-6 border-t border-gray-100 gap-4">  
        <button 
          type="button"
          onClick={onSaveTemplate}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? 'Saving...' : 'Save Template'}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

      <JoiningInstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={() => setIsInstructionsModalOpen(false)}
        jobId={jobId}
        isDraft={jobDetails?.isDraft}
        initialInstructions={jobDetails?.joiningInstructions}
        onSaveSuccess={async () => {
          setIsInstructionsModalOpen(false);
          if (typeof refetchJobDetails === 'function') {
            await refetchJobDetails();
          }
          onSaveTemplate();
        }}
      />

    </div>
  );
};

export default OfferLetterTemplate;
