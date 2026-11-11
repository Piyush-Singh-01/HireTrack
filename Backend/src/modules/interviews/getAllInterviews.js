import Application from '../applications/applicantSchema.js';

/**
 * Get All Interviews Controller (tenant-safe)
 */
const getAllInterviews = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({ 
        success: false,
        message: 'Company context missing',
      });
    }

    const { 
      status, // Not Started, In Progress, Completed, Cancelled
      jobId,
      interviewRound,
      page = 1,
      limit = 10
    } = req.query;

    // Build query filter
    const filter = { companyCode }; // ✅ Add companyCode filter
    
    if (status) {
      filter['interviewDetails.interviewStatus'] = status;
    }
    
    if (jobId) {
      filter.jobId = jobId;
    }
    
    if (interviewRound) {
      filter['interviewDetails.interviewRound'] = interviewRound;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch interviews with pagination
    const interviews = await Application.find(filter)
      .populate('jobId', 'title location department')
      .select('firstName lastName email contactNumber profileStatus interviewDetails candidateRating candidateFeedback')
      .sort({ 'interviewDetails.interviewStartedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalCount = await Application.countDocuments(filter);

    // Format response
    const formattedInterviews = interviews.map(interview => ({
      applicantId: interview._id,
      applicantName: `${interview.firstName} ${interview.lastName}`,
      email: interview.answers?.email || interview.email,
      contactNumber: interview.answers?.mobile || interview.contactNumber,
      jobTitle: interview.jobId?.title,
      profileStatus: interview.profileStatus,
      interviewStatus: interview.interviewDetails?.interviewStatus || 'Not Started',
      interviewRound: interview.interviewDetails?.interviewRound,
      interviewer: interview.interviewDetails?.interviewer,
      meetingLink: interview.interviewDetails?.meetingLink,
      startedAt: interview.interviewDetails?.interviewStartedAt,
      endedAt: interview.interviewDetails?.interviewEndedAt,
      duration: interview.interviewDetails?.interviewDuration,
      candidateRating: interview.candidateRating
    }));

    return res.status(200).json({
      success: true,
      message: 'Interviews retrieved successfully',
      data: {
        interviews: formattedInterviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('getAllInterviews error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to get interviews', 
      error: error.message 
    });
  }
};

export default getAllInterviews;
