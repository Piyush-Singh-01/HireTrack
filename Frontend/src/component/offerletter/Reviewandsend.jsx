import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import img from "../../assets/offerletterimg/rafiki2.png";
import { Loader2 } from 'lucide-react'; 
import OfferLetterStepper from './OfferLetterStepper';
import OfferSuccessModal from './OfferSuccessModal';

/**
 * ReviewAndSend (UI Component)
 * Focused on rendering the Step 3 Read-only Review layout:
 * - Read-only fields across all 9 configuration sections
 * - Rafiki illustration banner
 * - Action footer ("Previous" & "Send Offer Letter" with loader)
 * - Success popup modal (OfferSuccessModal)
 */
const ReviewAndSend = ({
  formData: propFormData,
  logo: propLogo,
  jobId: propJobId,
  candidate: propCandidate,
  status: propStatus,
  showSuccess = false,
  setShowSuccess = () => {},
  isSending = false,
  onSend,
  onBack,
  onComplete,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const formData = propFormData !== undefined ? propFormData : state.formData || {};
  const logo = propLogo !== undefined ? propLogo : state.logo;
  const jobId = propJobId !== undefined ? propJobId : state.jobId;
  const candidate = propCandidate !== undefined ? propCandidate : state.candidate;
  const status = propStatus !== undefined ? propStatus : state.status;

  const [localShowSuccess, setLocalShowSuccess] = useState(false);
  const isSuccessOpen = showSuccess || localShowSuccess;
  const closeSuccess = () => {
    setShowSuccess(false);
    setLocalShowSuccess(false);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/offerletter', { state: { jobId, status, candidate, formData, logo } });
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/viewApplicants', { state: { jobId, status, tab: 'Hired' } });
    }
  };

  const handleSend = () => {
    if (onSend) {
      onSend();
    }
  };

  return (
    <div className="bg-white font-sans text-gray-800 p-6 lg:p-8 relative">
      
      {/* Success Popup Overlay */}
      <OfferSuccessModal
        isOpen={isSuccessOpen}
        onClose={closeSuccess}
        onAction={handleComplete}
        actionLabel="Go back to Hired Candidates"
        title="Offer Letter Sent Successfully"
      />

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <button 
            type="button"
            onClick={handleBack}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Back to Offer Letter Input"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#1e293b]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-[28px] font-bold text-[#2A3B5C]">Send Offer Letter</h1>
        </div>
        <h2 className="text-2xl text-[#2A3B5C] mb-1">Review and send</h2>
        <p className="text-gray-500 text-sm">Review and check the given information is correct.</p>
      </div>

      {/* Stepper */}
      <OfferLetterStepper currentStep={3} />

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
        <div className="flex-1 max-w-3xl pb-24">
          {/* 1. Company Details */}
          <div className="mb-8">
            <h3 className="text-blue-600 font-semibold text-lg mb-4">1. Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Company Name</label>
                  <input type="text" value={formData.companyName || ''} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Company Address</label>
                  <textarea value={formData.companyAddress || ''} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm h-[100px] resize-none bg-gray-50 outline-none leading-relaxed"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Website</label>
                  <input type="text" value={formData.website || ''} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
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
                </div>
              </div>
            </div>
          </div>

          {/* 2. Greeting */}
          <div className="mb-8">
            <h3 className="text-blue-600 font-semibold text-lg mb-4">2. Greeting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Salutation</label>
                <input type="text" value={formData.salutation || 'Dear'} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Candidate Name</label>
                <input type="text" value={formData.candidateName || ''} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Intro Paragraph</label>
              <textarea value={formData.introParagraph || ''} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm min-h-[80px] bg-gray-50 outline-none leading-relaxed resize-none" />
            </div>
          </div>

          {/* 3. Candidate Details */}
          <div className="mb-8">
            <h3 className="text-blue-600 font-semibold text-lg mb-4">3. Candidate Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Candidate Name</label>
                <input type="text" value={formData.candidateName || ''} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
                <input type="text" value={formData.date || ''} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
              </div>
            </div>
          </div>

          {/* 4. Details */}
          <div className="mb-8">
            <h3 className="text-blue-600 font-semibold text-lg mb-4 mt-4">
              4. {formData.employmentType === 'Employee' ? 'Employee Details' : 'Internship Details'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Position / Role</label>
                 <input type="text" value={formData.position || ''} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Duration</label>
                <input type="text" value={formData.duration || ''} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
                <input type="text" value={formData.startDate || ''} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
              </div>
              {formData.employmentType !== 'Employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
                  <input type="text" value={formData.endDate || ''} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Notice Period</label>
                <input 
                  type="text" 
                  value={formData.noticePeriod && /^\d+$/.test(formData.noticePeriod.trim()) ? `${formData.noticePeriod.trim()} Working Days` : (formData.noticePeriod || '')} 
                  readOnly 
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" 
                />
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Location</label>
                <input type="text" value={formData.location || 'Remote'} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  {formData.employmentType === 'Employee' ? 'Salary' : 'Stipend'}
                </label>
                <input type="text" value={formData.employmentType === 'Employee' ? (formData.salary || '') : (formData.stipend || '')} readOnly className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 outline-none" />
              </div>
            </div>
          </div>

          {/* 5. Responsibilities */}
          <div className="mb-8">
             <h3 className="text-blue-600 font-semibold text-lg mb-4">5. Responsibilities</h3>
             <textarea 
               value={formData.responsibilities || ''}
               readOnly
               className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm min-h-[160px] resize-none bg-gray-50 outline-none leading-relaxed"
             />
          </div>

          {/* 6. Notice */}
          <div className="mb-8">
             <h3 className="text-blue-600 font-semibold text-lg mb-4">6. Notice</h3>
             <textarea 
               value={formData.notice || ''}
               readOnly
               className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm min-h-[80px] resize-none bg-gray-50 outline-none leading-relaxed"
             />
          </div>

          {/* 7. Closing Note */}
          <div className="mb-8">
             <h3 className="text-blue-600 font-semibold text-lg mb-4">7. Closing Note</h3>
             <textarea 
               value={formData.closingNote || ''}
               readOnly
               className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm min-h-[80px] resize-none bg-gray-50 outline-none leading-relaxed"
             />
          </div>

          {/* 8. Signature */}
          <div className="mb-8">
             <h3 className="text-blue-600 font-semibold text-lg mb-4">8. Signature</h3>
             <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                {formData.signature ? (
                  <img src={formData.signature} alt="Signature" className="max-h-24 object-contain" />
                ) : (
                  <span className="text-sm text-gray-400">No Signature Uploaded</span>
                )}
             </div>
          </div>

          {/* 9. Agreement */}
          <div className="mb-8">
             <h3 className="text-blue-600 font-semibold text-lg mb-4">9. Agreement</h3>
             <div className="flex flex-col items-center p-6 border border-gray-200 rounded-lg bg-gray-50">
                {formData.agreement ? (
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Agreement Attached</span>
                    <p className="text-xs text-gray-500 mt-1">PDF document will be attached to the email</p>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">No Agreement Attached</span>
                )}
             </div>
          </div>
        </div>

        {/* Right Illustration Content */}
        <div className="hidden lg:flex flex-col items-center w-[30vw] xl:w-[30vw]">
          <div className="sticky top-12 w-full h-[400px] flex items-center justify-center">
            <img src={img} alt="Checklist Illustration" className="max-w-full h-auto" />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-100 gap-4">
        <button 
          type="button"
          onClick={handleBack}
          className="w-full sm:w-auto flex items-center justify-center gap-2 border border-blue-600 text-blue-600 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors cursor-pointer"
        >
          Previous
        </button>
        
        <button 
          type="button"
          onClick={handleSend}
          disabled={isSending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Offer Letter
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default ReviewAndSend;