import { createContext, useContext, useState } from "react";




const AppModulesContext = createContext()

const defaultSelectedModules = {
  personalInfo: true,
  education: true,
  experience: true,
  skills: true,
  attachments: true,
  screening: true,
};

const defaultFormData = {
  // Section 1

  // Part 1 (Personal Info)
  firstName: "",
  middleName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  postalCode: "",
  state: "",
  country: "",
  email: "",
  contactNumber: "",
  gender: "",
  experienceLevel: "",

  // Part 2 (Education)
  education: [
    {
      institution: "",
      degreeLevel: "",
      program: "",
      startDate: "",
      endDate: "",
      yearOfGraduation: "",
      gpaOrPercent: "",
      pursuing: false,
    },
  ],

  // Section 2

  // Part 3 (Experience)
  experience: [
    {
      companyName: "",
      role: "",
      startDate: "",
      endDate: "",
      responsibility: "",
      currentCTC: "",
      expectedCTC: "",
      noticePeriod: "",
    },
  ],

  // Part 4 (Skills)
  skills: [],

  // Part 5 (Attachments)
  attachments: [],

  referralSource: "",
  consent: false,
  termsAccepted: false,

  // Part 6 (Screening Questions)
  screeningQuestions: {
    personalInfo: [],
    education: [],
    experience: [],
    skills: [],
    attachments: [],
    addInfo: [],
    screening: [],
  },
  // Module-level config
  moduleConfig: {
    education: { allowMultipleEntries: false },
    experience: { allowMultipleEntries: false },
  },
};

const  AppModulesProvider = ({ children }) => {
  const [selectedModules, setSelectedModules] = useState(defaultSelectedModules);


  const [formData, setFormData] = useState(defaultFormData);

  
const toggleModule = (moduleName) => {
  setSelectedModules((prev) => ({
    ...prev,
    [moduleName]: !prev[moduleName],
  }));
};

const setAllModules = (modulesObj) => {
  setSelectedModules(modulesObj);
};

return (
  <AppModulesContext.Provider
    value={{
      selectedModules,
      toggleModule,
      setAllModules,
      formData,
      setFormData,
      resetFormData: () => {
        setFormData(defaultFormData);
        setSelectedModules(defaultSelectedModules);
      },
    }}
  >
    {children}
  </AppModulesContext.Provider>
);
}

export default AppModulesProvider;

export const useApplicationModules = () => {
  const context = useContext(AppModulesContext);
  if (!context) {
    throw new Error("useApplicationModules must be used within an AppModulesProvider");
  }
  return context;
}

