import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaRecycle } from "react-icons/fa";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import createAccountImg from "../../assets/login/createAccimg1.png";
import img2 from "../../assets/login/img2.png";
import waveImage1 from "../../assets/login/Wave1.png";
import { useToast } from "../../utils/ToastContext";

/**
 * Presentational Component for the Create Account / Registration screen.
 * Handles form field inputs, inline validation, captcha verification,
 * and the visual artwork panel with carousel.
 */
const CreateAccount = ({
  onSubmit,
  isLoading = false,
  onLoginClick,
}) => {
  const images = [createAccountImg, img2];
  const [currentIndex, setCurrentIndex] = useState(0);
  const { showToast } = useToast();
  const [animate, setAnimate] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHuman, setIsHuman] = useState(false);

  const emptyErrors = {
    userName: "",
    businessEmail: "",
    organizationName: "",
    contactNumber: "",
    createNewPassword: "",
    confirmNewPassword: "",
  };

  const [errors, setErrors] = useState(emptyErrors);
  const [form, setForm] = useState({
    userName: "",
    businessEmail: "",
    organizationName: "",
    contactNumber: "",
    createNewPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    const interval = setInterval(() => setAnimate((prev) => !prev), 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % images.length),
      3000
    );
    return () => clearInterval(interval);
  }, [images.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    const updatedErrors = { ...errors, [name]: "" };

    if (name === "createNewPassword") {
      if (value.length < 6) {
        updatedErrors.createNewPassword = "Password must be at least 6 characters";
      }
      if (updatedForm.confirmNewPassword && value !== updatedForm.confirmNewPassword) {
        updatedErrors.confirmNewPassword = "Passwords do not match";
      } else {
        updatedErrors.confirmNewPassword = "";
      }
    }

    if (name === "confirmNewPassword") {
      updatedErrors.confirmNewPassword =
        value !== updatedForm.createNewPassword ? "Passwords do not match" : "";
    }

    setErrors(updatedErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = { ...emptyErrors };
    let hasErrors = false;

    if (!form.userName.trim()) {
      newErrors.userName = "Name is required";
      hasErrors = true;
    }
    if (!form.businessEmail.trim()) {
      newErrors.businessEmail = "Business email is required";
      hasErrors = true;
    } else if (!/^\S+@\S+\.\S+$/.test(form.businessEmail)) {
      newErrors.businessEmail = "Enter a valid email";
      hasErrors = true;
    }
    if (!form.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
      hasErrors = true;
    }
    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number required";
      hasErrors = true;
    }
    if (form.createNewPassword.length < 6) {
      newErrors.createNewPassword = "Password must be at least 6 characters";
      hasErrors = true;
    }
    if (form.createNewPassword !== form.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      showToast("Please fix the highlighted errors", "error");
      return;
    }

    setErrors({});
    if (!isHuman) {
      showToast("Please verify you are not a robot", "info");
      return;
    }

    if (onSubmit) {
      onSubmit(form);
    }
  };

  const fields = [
    { name: "userName", label: "Full name", placeholder: "e.g. Alex Morgan", type: "text", icon: UserRound, autoComplete: "name" },
    { name: "businessEmail", label: "Business email", placeholder: "you@company.com", type: "email", icon: Mail, autoComplete: "email" },
    { name: "organizationName", label: "Organization name", placeholder: "Your company or organization", type: "text", icon: Building2, autoComplete: "organization" },
    { name: "contactNumber", label: "Contact number", placeholder: "Enter your phone number", type: "tel", icon: Phone, autoComplete: "tel" },
  ];

  const renderField = ({ name, label, placeholder, type, icon: Icon, autoComplete }) => (
    <div className="signup-field" key={name}>
      <label htmlFor={name} className="signup-label">
        {label}<span className="signup-required">*</span>
      </label>
      <div className={`signup-input-wrap ${errors[name] ? "has-error" : ""}`}>
        <Icon size={17} className="signup-input-icon" aria-hidden="true" />
        <input
          id={name}
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          className="signup-input"
        />
      </div>
      {errors[name] && <p id={`${name}-error`} className="signup-error">{errors[name]}</p>}
    </div>
  );

  const renderPasswordField = (name, label, visible, setVisible, autoComplete) => (
    <div className="signup-field" key={name}>
      <label htmlFor={name} className="signup-label">
        {label}<span className="signup-required">*</span>
      </label>
      <div className={`signup-input-wrap ${errors[name] ? "has-error" : ""}`}>
        <LockKeyhole size={17} className="signup-input-icon" aria-hidden="true" />
        <input
          id={name}
          type={visible ? "text" : "password"}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={name === "createNewPassword" ? "At least 6 characters" : "Re-enter your password"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
          className="signup-input signup-password-input"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="signup-password-toggle"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {errors[name] && <p id={`${name}-error`} className="signup-error">{errors[name]}</p>}
      {name === "createNewPassword" && form.createNewPassword.length > 0 && form.createNewPassword.length < 6 && !errors[name] && (
        <p className="signup-helper">Use at least 6 characters.</p>
      )}
    </div>
  );

  return (
    <main className="signup-page">
      <div className="signup-orb signup-orb-one" />
      <div className="signup-orb signup-orb-two" />
      <div className="signup-waves" aria-hidden="true">
        <img src={waveImage1} alt="" className={`signup-wave signup-wave-one ${animate ? "wave-shift" : ""}`} />
        <img src={waveImage1} alt="" className={`signup-wave signup-wave-two ${animate ? "wave-shift-reverse" : ""}`} />
      </div>

      <section className="signup-layout">
        <aside className="signup-visual-panel">
          <div className="signup-brand-pill"><span className="signup-brand-mark"><Sparkles size={17} /></span> Your next chapter starts here</div>
          <div className="signup-visual-copy">
            <p className="signup-eyebrow">BUILT FOR WHAT'S NEXT</p>
            <h1>Bring your team<br /><span>together.</span></h1>
            <p className="signup-visual-description">Create your workspace and give your organization a smarter place to grow.</p>
          </div>
          <div className="signup-artwork-frame">
            <div className="signup-artwork-glow" />
            <img
              key={currentIndex}
              src={images[currentIndex]}
              alt="Illustration for creating an account"
              className="signup-artwork"
            />
            <div className="signup-floating-card signup-floating-card-top"><span className="signup-mini-icon"><ShieldCheck size={17} /></span><span><strong>One workspace</strong><small>Everything in sync</small></span></div>
            <div className="signup-floating-card signup-floating-card-bottom"><span className="signup-online-dot" /><span><strong>Ready when you are</strong><small>Start in just a few steps</small></span></div>
          </div>
          <div className="signup-visual-footer"><span>Simple setup.</span><span>Better collaboration.</span><span>Room to grow.</span></div>
        </aside>

        <section className="signup-form-panel" aria-labelledby="signup-title">
          <div className="signup-form-topline"><span className="signup-step-indicator"><span /> ACCOUNT SETUP</span><span className="signup-secure-note"><ShieldCheck size={15} /> Secure registration</span></div>
          <header className="signup-heading">
            <div className="signup-heading-icon"><Sparkles size={21} /></div>
            <h2 id="signup-title">Create your account</h2>
            <p>Get started with your organization in a few easy steps.</p>
          </header>

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <div className="signup-section-heading"><span>Your details</span><span>01 <i /> 02</span></div>
            <div className="signup-fields-grid">{fields.map(renderField)}</div>

            <div className="signup-section-heading signup-password-heading"><span>Secure your account</span><span>Keep it private <LockKeyhole size={13} /></span></div>
            <div className="signup-fields-grid signup-password-grid">
              {renderPasswordField("createNewPassword", "Create password", showCreatePassword, setShowCreatePassword, "new-password")}
              {renderPasswordField("confirmNewPassword", "Confirm password", showConfirmPassword, setShowConfirmPassword, "new-password")}
            </div>

            <div className={`signup-human-check ${isHuman ? "is-checked" : ""}`}>
              <label className="signup-check-label">
                <input type="checkbox" checked={isHuman} onChange={(e) => setIsHuman(e.target.checked)} />
                <span className="signup-custom-checkbox">{isHuman && <CheckCircle2 size={16} />}</span>
                <span className="signup-check-copy"><strong>I'm not a robot</strong><small>Help us keep your account safe</small></span>
              </label>
              <FaRecycle className="signup-recycle-icon" aria-hidden="true" />
            </div>

            <button type="submit" disabled={isLoading} className="signup-submit-button">
              <span>{isLoading ? "Creating your account..." : "Create account"}</span>
              {isLoading ? <span className="signup-spinner" /> : <ArrowRight size={18} />}
            </button>
            <p className="signup-login-prompt">Already have an account? <Link to="/" onClick={onLoginClick}>Log in <ArrowRight size={14} /></Link></p>
            <p className="signup-terms-note"><ShieldCheck size={13} /> Your information is protected and kept private.</p>
          </form>
        </section>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
        .signup-page{--signup-ink:#172554;--signup-muted:#718096;--signup-blue:#315ee8;--signup-blue-dark:#2348c7;--signup-line:#e4eaf4;position:relative;isolation:isolate;min-height:100vh;overflow:hidden;background:#f5f8ff;color:var(--signup-ink);font-family:'DM Sans',sans-serif;padding:clamp(16px,3vw,42px);display:flex;align-items:center;justify-content:center}
        .signup-page *{box-sizing:border-box}.signup-orb{position:absolute;z-index:-2;border-radius:999px;filter:blur(1px);pointer-events:none}.signup-orb-one{width:440px;height:440px;top:-250px;left:-150px;background:radial-gradient(circle,rgba(117,151,255,.22),rgba(117,151,255,0) 70%);animation:orbFloat 9s ease-in-out infinite}.signup-orb-two{width:520px;height:520px;right:-240px;bottom:-290px;background:radial-gradient(circle,rgba(90,213,207,.18),rgba(90,213,207,0) 70%);animation:orbFloat 11s ease-in-out infinite reverse}
        .signup-waves{position:absolute;inset:auto 0 0;height:220px;z-index:-1;overflow:hidden;pointer-events:none;opacity:.19}.signup-wave{position:absolute;width:125%;max-width:none;left:-12%;bottom:-100px;transition:transform 8s ease-in-out;mix-blend-mode:multiply}.signup-wave-two{bottom:-130px;opacity:.6}.signup-wave-one.wave-shift{transform:translateX(7%)}.signup-wave-two.wave-shift-reverse{transform:translateX(-6%)}
        .signup-layout{width:min(1240px,100%);min-height:min(860px,calc(100vh - 48px));display:grid;grid-template-columns:minmax(0,.92fr) minmax(540px,1.08fr);background:rgba(255,255,255,.83);border:1px solid rgba(255,255,255,.9);border-radius:30px;overflow:hidden;box-shadow:0 28px 90px rgba(38,64,125,.13),0 3px 12px rgba(38,64,125,.04);backdrop-filter:blur(18px);animation:signupEnter .75s cubic-bezier(.2,.8,.2,1) both}
        .signup-visual-panel{position:relative;overflow:hidden;display:flex;flex-direction:column;min-width:0;padding:clamp(28px,4vw,54px);color:white;background:radial-gradient(ellipse at 10% 10%,rgba(111,149,255,.48),transparent 35%),radial-gradient(ellipse at 100% 90%,rgba(27,196,188,.28),transparent 35%),linear-gradient(145deg,#122d76 0%,#234fc0 53%,#316de7 100%)}.signup-visual-panel:before{content:"";position:absolute;inset:0;opacity:.12;background-image:radial-gradient(rgba(255,255,255,.85) .7px,transparent .7px);background-size:20px 20px;mask-image:linear-gradient(to bottom,black,transparent 88%);pointer-events:none}.signup-visual-panel:after{content:"";position:absolute;width:380px;height:380px;border:1px solid rgba(255,255,255,.13);border-radius:50%;right:-220px;top:28%;box-shadow:0 0 0 42px rgba(255,255,255,.035),0 0 0 84px rgba(255,255,255,.025);pointer-events:none}
        .signup-brand-pill{position:relative;z-index:1;display:inline-flex;align-items:center;gap:10px;align-self:flex-start;padding:8px 13px 8px 8px;border:1px solid rgba(255,255,255,.19);border-radius:999px;background:rgba(255,255,255,.09);font-size:12px;font-weight:600;letter-spacing:.01em;backdrop-filter:blur(12px);animation:fadeSlideIn .65s .1s both}.signup-brand-mark{width:28px;height:28px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.18)}.signup-visual-copy{position:relative;z-index:1;margin-top:clamp(34px,5vh,58px);animation:fadeSlideIn .7s .18s both}.signup-eyebrow{margin:0 0 13px;color:#a9c9ff;font-size:10px;font-weight:700;letter-spacing:.2em}.signup-visual-copy h1{font-family:'Manrope',sans-serif;margin:0;font-size:clamp(34px,3.6vw,52px);font-weight:800;letter-spacing:-.055em;line-height:1.12}.signup-visual-copy h1 span{color:#91f0e7}.signup-visual-description{max-width:330px;margin:17px 0 0;color:rgba(255,255,255,.72);font-size:14px;line-height:1.8}
        .signup-artwork-frame{position:relative;flex:1;min-height:250px;display:flex;align-items:center;justify-content:center;margin:12px -20px 0;isolation:isolate}.signup-artwork-glow{position:absolute;width:68%;aspect-ratio:1;border-radius:50%;background:rgba(136,178,255,.18);filter:blur(30px);animation:glowPulse 5s ease-in-out infinite}.signup-artwork{position:relative;z-index:1;display:block;max-width:100%;width:min(420px,100%);max-height:340px;object-fit:contain;filter:drop-shadow(0 24px 24px rgba(7,22,67,.18));animation:artworkFloat 5s ease-in-out infinite,artworkReveal .55s both}.signup-floating-card{position:absolute;z-index:2;display:flex;align-items:center;gap:10px;padding:11px 14px;border:1px solid rgba(255,255,255,.42);border-radius:14px;background:rgba(255,255,255,.94);color:#20315b;box-shadow:0 12px 32px rgba(7,22,67,.15);animation:cardFloat 5s ease-in-out infinite}.signup-floating-card-top{top:13%;right:1%;animation-delay:-1.5s}.signup-floating-card-bottom{bottom:10%;left:0;animation-delay:-3s}.signup-mini-icon{width:32px;height:32px;display:grid;place-items:center;border-radius:10px;background:#e9f1ff;color:#315ee8}.signup-floating-card strong,.signup-floating-card small{display:block;white-space:nowrap}.signup-floating-card strong{font-size:11px;font-weight:700}.signup-floating-card small{margin-top:3px;color:#8290aa;font-size:10px}.signup-online-dot{width:9px;height:9px;border-radius:50%;background:#23c89a;box-shadow:0 0 0 4px #e0fbf1}.signup-visual-footer{position:relative;z-index:1;display:flex;justify-content:space-between;gap:12px;padding-top:20px;border-top:1px solid rgba(255,255,255,.17);color:rgba(255,255,255,.66);font-size:10px;letter-spacing:.02em}
        .signup-form-panel{min-width:0;padding:clamp(28px,4vw,54px) clamp(25px,4.5vw,64px);background:rgba(255,255,255,.9);display:flex;flex-direction:column;justify-content:center;animation:formReveal .8s .12s both}.signup-form-topline{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:25px}.signup-step-indicator{display:flex;align-items:center;gap:9px;color:#6f7e9b;font-size:10px;font-weight:700;letter-spacing:.14em}.signup-step-indicator>span{width:8px;height:8px;border-radius:50%;background:#39c9a0;box-shadow:0 0 0 4px #e5fbf3}.signup-secure-note{display:flex;align-items:center;gap:5px;color:#8290a8;font-size:10px}.signup-secure-note svg{color:#36b991}.signup-heading{margin-bottom:27px}.signup-heading-icon{width:42px;height:42px;display:grid;place-items:center;margin-bottom:14px;border-radius:13px;color:#315ee8;background:linear-gradient(145deg,#eef3ff,#e2eaff);box-shadow:inset 0 1px 0 white}.signup-heading h2{margin:0;color:#172554;font-family:'Manrope',sans-serif;font-size:clamp(25px,2.5vw,32px);font-weight:800;letter-spacing:-.045em;line-height:1.2}.signup-heading p{margin:9px 0 0;color:#8290a8;font-size:13px;line-height:1.65}.signup-form{width:100%}.signup-section-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 13px;color:#394969;font-size:11px;font-weight:700}.signup-section-heading>span:last-child{display:flex;align-items:center;gap:6px;color:#9aa6bb;font-size:10px;font-weight:600}.signup-section-heading i{width:22px;height:3px;border-radius:4px;background:#dce5fb}.signup-fields-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px 13px}.signup-field{min-width:0;animation:fieldReveal .55s both}.signup-field:nth-child(2){animation-delay:.05s}.signup-field:nth-child(3){animation-delay:.1s}.signup-field:nth-child(4){animation-delay:.15s}.signup-label{display:block;margin-bottom:7px;color:#384866;font-size:11px;font-weight:700}.signup-required{margin-left:3px;color:#f16f83}.signup-input-wrap{position:relative;display:flex;align-items:center;min-width:0;border:1px solid #e2e8f2;border-radius:11px;background:#fbfcff;transition:border-color .22s,box-shadow .22s,background .22s,transform .22s}.signup-input-wrap:focus-within{border-color:#7896f8;background:white;box-shadow:0 0 0 4px rgba(67,105,235,.1);transform:translateY(-1px)}.signup-input-wrap.has-error{border-color:#f0a0a8;background:#fffafb}.signup-input-icon{flex-shrink:0;margin-left:12px;color:#9aa8c0;transition:color .2s}.signup-input-wrap:focus-within .signup-input-icon{color:#315ee8}.signup-input{width:100%;min-width:0;height:43px;padding:0 12px;border:0;outline:0;background:transparent;color:#253555;font-family:inherit;font-size:11px}.signup-input::placeholder{color:#a7b1c3;opacity:1}.signup-password-input{padding-right:4px}.signup-password-toggle{display:grid;place-items:center;flex-shrink:0;width:38px;height:40px;margin-right:2px;border:0;border-radius:8px;background:transparent;color:#8997af;cursor:pointer;transition:background .2s,color .2s}.signup-password-toggle:hover{background:#eef3ff;color:#315ee8}.signup-error{margin:5px 0 0 2px;color:#d94d61;font-size:10px;line-height:1.4;animation:errorIn .2s both}.signup-helper{margin:5px 0 0 2px;color:#8a97ac;font-size:10px}.signup-password-heading{margin-top:23px}.signup-password-grid{gap:13px}.signup-human-check{display:flex;align-items:center;justify-content:space-between;margin-top:20px;padding:12px 14px;border:1px solid #e5eaf3;border-radius:12px;background:#fafbfe;transition:border-color .2s,background .2s}.signup-human-check.is-checked{border-color:#a8e8d3;background:#f4fdf9}.signup-check-label{display:flex;align-items:center;gap:10px;min-width:0;cursor:pointer}.signup-check-label input{position:absolute;width:1px;height:1px;opacity:0}.signup-custom-checkbox{display:grid;place-items:center;width:21px;height:21px;flex-shrink:0;border:1.5px solid #cbd5e5;border-radius:6px;background:white;color:#159d76;transition:all .2s}.signup-human-check.is-checked .signup-custom-checkbox{border-color:#31bd94;background:#e2fbf1;transform:scale(1.04)}.signup-check-copy strong,.signup-check-copy small{display:block}.signup-check-copy strong{color:#3c4b68;font-size:11px;font-weight:700}.signup-check-copy small{margin-top:3px;color:#9aa5b8;font-size:10px}.signup-recycle-icon{margin-right:2px;color:#7b8aa4;font-size:18px}.signup-submit-button{position:relative;display:flex;align-items:center;justify-content:center;gap:11px;width:100%;height:48px;margin-top:18px;padding:0 20px;border:0;border-radius:12px;background:linear-gradient(110deg,#315ee8,#4778f2);box-shadow:0 9px 18px rgba(49,94,232,.2),inset 0 1px 0 rgba(255,255,255,.2);color:white;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;overflow:hidden;transition:transform .22s,box-shadow .22s,background .22s}.signup-submit-button:before{content:"";position:absolute;top:-60%;left:-45%;width:35%;height:220%;transform:rotate(22deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.24),transparent);transition:left .65s}.signup-submit-button:hover{transform:translateY(-2px);background:linear-gradient(110deg,#284fd1,#3968e5);box-shadow:0 13px 24px rgba(49,94,232,.27)}.signup-submit-button:hover:before{left:120%}.signup-submit-button:active{transform:translateY(0) scale(.995)}.signup-submit-button:disabled{opacity:.72;cursor:wait;transform:none}.signup-submit-button svg,.signup-submit-button span{position:relative;z-index:1}.signup-spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.45);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite}.signup-login-prompt{display:flex;align-items:center;justify-content:center;gap:5px;margin:18px 0 0;color:#8591a7;font-size:16px}.signup-login-prompt a{display:inline-flex;align-items:center;gap:4px;color:#315ee8;font-weight:700;text-decoration:none;transition:gap .2s,color .2s}.signup-login-prompt a:hover{gap:7px;color:#193fbd}.signup-terms-note{display:flex;align-items:center;justify-content:center;gap:5px;margin:17px 0 0;color:#a0aabd;font-size:9px}.signup-terms-note svg{color:#50bfa0}
        @keyframes signupEnter{from{opacity:0;transform:translateY(20px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes formReveal{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}@keyframes fadeSlideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes fieldReveal{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes artworkReveal{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes artworkFloat{0%,100%{translate:0 0}50%{translate:0 -9px}}@keyframes cardFloat{0%,100%{translate:0 0}50%{translate:0 -7px}}@keyframes glowPulse{0%,100%{transform:scale(.94);opacity:.65}50%{transform:scale(1.08);opacity:1}}@keyframes orbFloat{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,16px)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes errorIn{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:1050px){.signup-layout{grid-template-columns:minmax(0,.8fr) minmax(500px,1.2fr)}.signup-visual-panel{padding:32px}.signup-form-panel{padding:34px}.signup-visual-copy h1{font-size:39px}.signup-floating-card-top{right:-3%}.signup-floating-card-bottom{left:-3%}}
        @media(max-width:800px){.signup-page{padding:14px;align-items:flex-start}.signup-layout{width:min(600px,100%);min-height:0;grid-template-columns:1fr;border-radius:24px}.signup-visual-panel{display:none}.signup-form-panel{padding:clamp(24px,6vw,40px);min-height:calc(100vh - 30px)}.signup-form-topline{margin-bottom:22px}.signup-heading{margin-bottom:24px}.signup-waves{height:140px}}
        @media(max-width:520px){.signup-page{padding:0;background:#f7f9ff}.signup-layout{min-height:100vh;border:0;border-radius:0;box-shadow:none}.signup-form-panel{min-height:100vh;padding:25px 20px 28px}.signup-form-topline{align-items:flex-start}.signup-secure-note{font-size:9px}.signup-heading h2{font-size:27px}.signup-fields-grid{grid-template-columns:1fr;gap:13px}.signup-password-heading{margin-top:21px}.signup-human-check{margin-top:18px}.signup-visual-footer{font-size:9px}}
        @media (min-width:801px) and (max-height:900px){
          .signup-page{padding:12px;min-height:100svh}
          .signup-layout{min-height:calc(100svh - 24px);height:calc(100svh - 24px)}
          .signup-form-panel{padding:20px clamp(24px,3vw,42px)}
          .signup-form-topline{margin-bottom:13px}
          .signup-heading{margin-bottom:15px}
          .signup-heading-icon{width:34px;height:34px;margin-bottom:9px;border-radius:10px}
          .signup-heading-icon svg{width:18px;height:18px}
          .signup-heading h2{font-size:clamp(24px,2.1vw,29px)}
          .signup-heading p{margin-top:5px;font-size:12px}
          .signup-section-heading{margin-bottom:9px}
          .signup-fields-grid{gap:10px 12px}
          .signup-label{margin-bottom:5px;font-size:10.5px}
          .signup-input{height:37px;font-size:10.5px}
          .signup-password-toggle{height:35px}
          .signup-password-heading{margin-top:15px}
          .signup-password-grid{gap:10px 12px}
          .signup-human-check{margin-top:13px;padding:9px 12px}
          .signup-submit-button{height:42px;margin-top:12px;font-size:13px}
          .signup-login-prompt{margin-top:12px;font-size:16px}
          .signup-terms-note{margin-top:9px}
          .signup-artwork-frame{min-height:160px;margin-top:4px}
          .signup-artwork{max-height:clamp(190px,34vh,280px);width:min(370px,100%)}
          .signup-visual-copy{margin-top:clamp(20px,3vh,34px)}
          .signup-visual-copy h1{font-size:clamp(32px,3vw,44px)}
          .signup-visual-description{margin-top:12px;font-size:13px}
          .signup-visual-footer{padding-top:12px}
        }
        @media (min-width:801px) and (max-height:740px){
          .signup-page{padding:8px}
          .signup-layout{min-height:calc(100svh - 16px);height:calc(100svh - 16px)}
          .signup-form-panel{padding:12px 26px}
          .signup-form-topline{margin-bottom:9px}
          .signup-heading{margin-bottom:10px}
          .signup-heading-icon{width:30px;height:30px;margin-bottom:7px}
          .signup-heading h2{font-size:24px}
          .signup-heading p{font-size:11px;margin-top:4px}
          .signup-fields-grid{gap:7px 10px}
          .signup-input{height:33px}
          .signup-password-toggle{height:31px}
          .signup-password-heading{margin-top:10px}
          .signup-human-check{margin-top:9px;padding:7px 10px}
          .signup-submit-button{height:38px;margin-top:9px}
          .signup-login-prompt{margin-top:7px;font-size:12px}
          .signup-terms-note{margin-top:6px}
        }
        @media(prefers-reduced-motion:reduce){.signup-page *, .signup-page *:before,.signup-page *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
      `}</style>
    </main>
  );
};

export default CreateAccount;
