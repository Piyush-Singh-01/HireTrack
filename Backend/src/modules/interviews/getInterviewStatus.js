import Application from '../applications/applicantSchema.js';

/**
 * Get Interview Status Controller (tenant-safe)
 */
const getInterviewStatus = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({ 
        success: false,
        message: 'Company context missing',
      });
    }

    const { applicantId } = req.params;

    if (!applicantId) {
      return res.status(400).json({ 
        success: false,
        message: 'applicantId is required' 
      });
    }

    // Find applicant by ID with job details and companyCode
    const applicant = await Application.findOne({ _id: applicantId, companyCode })
      .populate('jobId', 'title location department')
      .lean();

    if (!applicant) {
      return res.status(404).json({ 
        success: false,
        message: 'Applicant not found in your company' 
      });
    }

    const interviewInfo = {
      applicantId: applicant._id,
      applicantName: `${applicant.firstName} ${applicant.lastName}`,
      email: applicant.answers?.email || applicant.email,
      contactNumber: applicant.answers?.mobile || applicant.contactNumber,
      jobTitle: applicant.jobId?.title,
      profileStatus: applicant.profileStatus,
      interviewDetails: applicant.interviewDetails || {
        interviewStarted: false,
        interviewStatus: 'Not Started'
      },
      candidateFeedback: applicant.candidateFeedback,
      candidateRating: applicant.candidateRating
    };

    return res.status(200).json({
      success: true,
      message: 'Interview status retrieved successfully',
      data: interviewInfo
    });

  } catch (error) {
    console.error('getInterviewStatus error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to get interview status', 
      error: error.message 
    });
  }
};

export default getInterviewStatus;
