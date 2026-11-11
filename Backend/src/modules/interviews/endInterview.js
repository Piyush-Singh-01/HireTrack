import Application from '../applications/applicantSchema.js';

/**
 * End Interview Controller (tenant-safe)
 */
const endInterview = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;
    if (!companyCode) {
      return res.status(401).json({ 
        success: false,
        message: 'Company context missing',
      });
    }

    const { applicantId, interviewNotes, feedback } = req.body;

    if (!applicantId) {
      return res.status(400).json({ 
        success: false,
        message: 'applicantId is required' 
      });
    }

    // Tenant-safe applicant lookup
    const applicant = await Application.findOne({ 
      _id: applicantId, 
      companyCode 
    });

    if (!applicant) {
      return res.status(404).json({ 
        success: false,
        message: 'Applicant not found with provided ID or not part of your company' 
      });
    }

    if (applicant.interviewDetails?.interviewStatus !== 'In Progress') {
      return res.status(400).json({ 
        success: false,
        message: `Cannot end interview. Current status: ${applicant.interviewDetails?.interviewStatus || 'Not Started'}` 
      });
    }

    let actualDuration = null;
    if (applicant.interviewDetails.interviewStartedAt) {
      const endTime = new Date();
      const startTime = new Date(applicant.interviewDetails.interviewStartedAt);
      actualDuration = Math.round((endTime - startTime) / (1000 * 60));
    }

    applicant.interviewDetails.interviewStatus = 'Completed';
    applicant.interviewDetails.interviewEndedAt = new Date();
    applicant.interviewDetails.interviewDuration = actualDuration || applicant.interviewDetails.interviewDuration;

    if (interviewNotes) {
      applicant.interviewDetails.interviewNotes = interviewNotes;
    }

    if (feedback) {
      applicant.candidateFeedback = {
        ...applicant.candidateFeedback,
        ...feedback
      };
      if (feedback.candidateRating) applicant.candidateRating = feedback.candidateRating;
    }

    await applicant.save();

    return res.status(200).json({
      success: true,
      message: 'Interview ended successfully',
      data: {
        applicantId: applicant._id,
        applicantName: `${applicant.firstName} ${applicant.lastName}`,
        interviewStatus: applicant.interviewDetails.interviewStatus,
        startedAt: applicant.interviewDetails.interviewStartedAt,
        endedAt: applicant.interviewDetails.interviewEndedAt,
        duration: applicant.interviewDetails.interviewDuration,
        interviewRound: applicant.interviewDetails.interviewRound,
        candidateRating: applicant.candidateRating
      }
    });

  } catch (error) {
    console.error('endInterview error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to end interview', 
      error: error.message 
    });
  }
};

export default endInterview;
