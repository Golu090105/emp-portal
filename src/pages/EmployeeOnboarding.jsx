import { useState, useRef, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// ── Constants ──────────────────────────────────────────────────────────
const DIVISIONS  = ["ITSS","SAPSS","ITD","PSPD","Digital"];
const TYPES      = ["Named","Generic with AD","Built-in"];
const SUBTYPES   = ["System-ID","Third-Party","Generic"];
const GRADES     = ["Grade A","Grade B","Grade C","Grade D"];
// FIX 3: only 2 access types
const ACCESS_TYPES = ["Permanent","Temporary"];
const ROLES      = ["ANALYST","HSADM1","ADMIN1","L1","DOCADMIN1","INTELOPSKOLS","ENDPOINTSUDO","AZINDRA1"];
const LOCATION_TEAMS = {
  Kolkata:   ["Legacy Systems","SAP Basis KOL","Finance IT KOL","HR Systems KOL","INTELOPSKOLS Team"],
  Bangalore: ["Development Team","Cloud Ops","DevOps & CI/CD","AI/ML Platform","Azure AD Team"],
  Hyderabad: ["Security Ops","Compliance IT","Data Engineering","SOC Team"],
  Pune:      ["QA & Automation","Release Management","Performance Testing","Mobile QA"],
  Chennai:   ["IT Support L1","Network Operations","Infrastructure","DC Operations"],
  Mumbai:    ["CRM & Sales IT","Executive Support","BCP/DR Team","Digital Finance"],
};
const LOCATIONS = Object.keys(LOCATION_TEAMS);

const ACCESS_CATALOG = [
  { id:1537, name:"Sahayak",                                          roles:["ANALYST","L1","ADMIN1"] },
  { id:1544, name:"Network Login ID - Individual (AD Access)",        roles:["ADMIN1","HSADM1"] },
  { id:1550, name:"24x7 Internet Access",                             roles:["L1","ANALYST"] },
  { id:1527, name:"AD ID mapping for Hosting Server Administration",  roles:["HSADM1","ADMIN1"] },
  { id:4103, name:"RSA Cloud Super Admin",                            roles:["AZINDRA1","ENDPOINTSUDO"] },
  { id:1528, name:"AD ID mapping for AD Server Administration",       roles:["ADMIN1","HSADM1"] },
  { id:1529, name:"PAW",                                              roles:["L1","ANALYST"] },
  { id:1530, name:"AD ID mapping for DoIC Server Administration",     roles:["DOCADMIN1","ADMIN1"] },
  { id:1531, name:"AD ID mapping for Intel Server Administration",    roles:["INTELOPSKOLS","ADMIN1"] },
  { id:1532, name:"AD ID Mapping for Endpoint Security Administrator",roles:["ENDPOINTSUDO","ADMIN1"] },
  { id:1533, name:"Azure AD Access",                                  roles:["AZINDRA1","ADMIN1"] },
  { id:1534, name:"RSA Cloud Helpdesk Admin",                         roles:["AZINDRA1","HSADM1"] },
];

const EXISTING_LOGIN_IDS = ["admin001","user123","john.doe","jane.smith","itc_user1"];
const STEPS = [
  { id:1, label:"Joining Type" },
  { id:2, label:"Basic Info" },
  { id:3, label:"User Identity" },
  { id:4, label:"Access Requirements" },
  { id:5, label:"Document Upload" },
  { id:6, label:"Approval" },
  { id:7, label:"Review" },
];

// ── Shared styles ──────────────────────────────────────────────────────
const inp = {
  width:"100%", padding:"10px 12px", borderRadius:8, fontSize:14,
  border:"1.5px solid #e2e8f0", outline:"none", boxSizing:"border-box",
  background:"#fff", color:"#1e293b",
};
const lbl = { display:"block", fontSize:13, fontWeight:600, color:"#475569", marginBottom:6 };
const fg  = { marginBottom:18 };
const TH  = { padding:"10px 12px", textAlign:"left", fontSize:12, fontWeight:700,
               color:"#475569", borderBottom:"1.5px solid #e2e8f0", whiteSpace:"nowrap" };
const TD  = { padding:"10px 12px", borderBottom:"1px solid #f1f5f9", verticalAlign:"middle" };

// ── Reusable ────────────────────────────────────────────────────────────
function Field({ label, required=false, error="", children }) {
  return (
    <div style={fg}>
      <label style={lbl}>
        {label}{required && <span style={{ color:"#ef4444",marginLeft:4,fontWeight:"bold" }}>*</span>}
      </label>
      {children}
      {error && <div style={{ marginTop:6,fontSize:12,color:"#ef4444",fontWeight:500 }}>⚠ {error}</div>}
    </div>
  );
}
function TInput({ value,onChange,placeholder,type="text",error=false,inputProps={} }) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={e=>onChange(e.target.value)}
      style={{ ...inp, border:error?"1.5px solid #ef4444":inp.border }}
      {...inputProps} />
  );
}
function TSelect({ value,onChange,options=[],error=false }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ ...inp,cursor:"pointer",color:value?"#1e293b":"#94a3b8",
        border:error?"1.5px solid #ef4444":inp.border }}>
      <option value="">— Select —</option>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function Radio({ label,options,value,onChange,error,onClearError }) {
  return (
    <Field label={label} error={error}>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {options.map(opt=>(
          <div key={opt} onClick={()=>{ onChange(opt); if(onClearError) onClearError(); }}
            style={{
              display:"flex",alignItems:"center",gap:12,padding:"8px 12px",
              borderRadius:8,cursor:"pointer",fontSize:14,
              border:value===opt?"1.5px solid #3b82f6":"1.5px solid #e2e8f0",
              background:value===opt?"#eff6ff":"#f8fafc",
              color:value===opt?"#1d4ed8":"#334155",
              fontWeight:value===opt?600:400,
            }}>
            <div style={{ width:18,height:18,borderRadius:"50%",flexShrink:0,
              border:value===opt?"5px solid #3b82f6":"2px solid #cbd5e1" }} />
            {opt}
          </div>
        ))}
      </div>
    </Field>
  );
}
// STEP 1 — Login ID real-time DB check
function Step1({ d, s, errors, clearError }) {
  const [loginChecking,setLoginChecking] = useState(false);
  const [loginExists,setLoginExists]     = useState(false);
  const debounceRef = useRef(null);

  // 1: debounce → hit backend /check-login endpoint
  const checkLoginId = useCallback((val) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val) { setLoginExists(false); return; }
    setLoginChecking(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`http://localhost:5000/check-login/${encodeURIComponent(val)}`);
        const data = await res.json();
        setLoginExists(data.exists);
      } catch {
        // fallback to local list when backend is offline
        setLoginExists(EXISTING_LOGIN_IDS.includes(val.toLowerCase().trim()));
      }
      setLoginChecking(false);
    }, 600 );
  }, []);

  const loginError = loginExists ? "This Login ID already exists in the system" : errors.loginId;

  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",alignItems:"start" }}>
      <div>
        <Field label="Division" required error={errors.division}>
          <TSelect value={d.division} onChange={v=>{ s({...d,division:v}); clearError("division"); }}
            options={DIVISIONS} error={!!errors.division} />
        </Field>
        <Field label="Type" required error={errors.type}>
          <TSelect value={d.type} onChange={v=>{ s({...d,type:v}); clearError("type"); }}
            options={TYPES} error={!!errors.type} />
        </Field>
        <Field label="Login ID" required error={loginError}>
          <div style={{ position:"relative" }}>
            <input value={d.loginId} placeholder="Enter login ID"
              onChange={e=>{
                const val=e.target.value;
                s({...d,loginId:val});
                clearError("loginId");
                setLoginExists(false);
                checkLoginId(val);
              }}
              style={{ ...inp,
                border:(loginExists||errors.loginId)?"1.5px solid #ef4444":inp.border,
                paddingRight:36 }} />
            <div style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)" }}>
              {loginChecking && (
                <div style={{ width:16,height:16,borderRadius:"50%",
                  border:"2px solid #94a3b8",borderTopColor:"#3b82f6",
                  animation:"spin 0.7s linear infinite",display:"inline-block" }} />
              )}
              {!loginChecking && loginExists && <span style={{ color:"#ef4444",fontSize:16 }}>✕</span>}
              {!loginChecking && !loginExists && d.loginId && <span style={{ color:"#16a34a",fontSize:16 }}>✓</span>}
            </div>
          </div>
        </Field>
      </div>
      <div>
        <Radio label="Joining Type" options={["New Employee","Copy from Existing Employee"]}
          value={d.joiningType} onChange={v=>s({...d,joiningType:v})}
          error={errors.joiningType} onClearError={()=>clearError("joiningType")} />
        <Field label="Sub-Type">
          <TSelect value={d.subtype} onChange={v=>s({...d,subtype:v})} options={SUBTYPES} />
        </Field>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
// STEP 2 — Large passport photo LEFT | all fields RIGHT (same height)
function Step2({ d, s, errors, clearError }) {
  const imgRef = useRef();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imgTypes  = ["image/jpeg","image/jpg","image/png"];
    const fileTypes = [...imgTypes,
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!fileTypes.includes(file.type)) {
      alert("Allowed formats: JPG, JPEG, PNG, PDF, DOC, DOCX");
      return;
    }
    if (imgTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = ev => s({...d, profileImage:file, profileImagePreview:ev.target.result});
      reader.readAsDataURL(file);
    } else {
      s({...d, profileImage:file, profileImagePreview:"__doc__"});
    }
  };

  const isDoc = d.profileImagePreview === "__doc__";
  const hasPreview = !!d.profileImagePreview;

  return (
    <div style={{ display:"flex", gap:28, alignItems:"stretch" }}>
      {/* ══ LEFT — passport/stamp photo panel ══ */}
      <div style={{
        width:190, flexShrink:0,
        display:"flex", flexDirection:"column",
        background:"#f8fafc",
        border:"1.5px solid #e2e8f0",
        borderRadius:12,
        padding:"20px 16px",
        alignItems:"center",
        justifyContent:"space-between",
        gap:12,
      }}>
        {/* label */}
        <div style={{ fontSize:13, fontWeight:700, color:"#475569", alignSelf:"flex-start" }}>
          Profile Photo
        </div>

        {/* passport stamp frame — click anywhere to upload */}
        <div
          onClick={() => imgRef.current.click()}
          title="Click to upload photo"
          style={{
            width:150, height:180,
            borderRadius:8,
            cursor:"pointer",
            border: hasPreview ? "2.5px solid #3b82f6" : "2px dashed #cbd5e1",
            overflow:"hidden",
            background: hasPreview ? "#000" : "#eef2f7",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            boxShadow: hasPreview
              ? "0 4px 18px rgba(59,130,246,0.22)"
              : "0 1px 4px rgba(0,0,0,0.06)",
            transition:"all 0.2s",
            position:"relative",
          }}>

          {hasPreview && !isDoc && (
            <img src={d.profileImagePreview} alt="profile"
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          )}

          {isDoc && (
            <div style={{ textAlign:"center", padding:12 }}>
              <div style={{ fontSize:48, lineHeight:1 }}>📄</div>
              <div style={{ fontSize:11, color:"#64748b", marginTop:8,
                wordBreak:"break-all", maxWidth:130, lineHeight:1.4 }}>
                {d.profileImage?.name}
              </div>
            </div>
          )}

          {!hasPreview && (
            <div style={{ textAlign:"center", padding:12, userSelect:"none" }}>
              <div style={{ fontSize:52, lineHeight:1, opacity:0.35 }}>👤</div>
              <div style={{ fontSize:11, color:"#94a3b8", marginTop:10, lineHeight:1.5, fontWeight:500 }}>
                Click to upload<br/>photo
              </div>
            </div>
          )}

          {/* hover overlay hint when photo is already uploaded */}
          {hasPreview && !isDoc && (
            <div style={{
              position:"absolute", inset:0,
              background:"rgba(0,0,0,0.38)",
              display:"flex", alignItems:"center", justifyContent:"center",
              opacity:0, transition:"opacity 0.18s",
              fontSize:12, color:"#fff", fontWeight:600,
              // Pure CSS hover not possible inline; handled via title tooltip
            }} />
          )}
        </div>

        {/* action buttons row */}
        <div style={{ display:"flex", flexDirection:"column", gap:7, width:"100%" }}>
          <button type="button" onClick={() => imgRef.current.click()}
            style={{
              padding:"7px 0", borderRadius:7, fontSize:12, fontWeight:600,
              border:"1px solid #3b82f6", background:"#eff6ff", color:"#2563eb",
              cursor:"pointer", width:"100%", textAlign:"center",
            }}>
            {hasPreview ? "✏ Change Photo" : "⬆ Upload Photo"}
          </button>
          {hasPreview && (
            <button type="button"
              onClick={() => s({...d, profileImage:null, profileImagePreview:""})}
              style={{
                padding:"6px 0", borderRadius:7, fontSize:12, fontWeight:500,
                border:"1px solid #fca5a5", background:"#fff1f2", color:"#ef4444",
                cursor:"pointer", width:"100%", textAlign:"center",
              }}>
              ✕ Remove
            </button>
          )}
        </div>

        {/* format hint */}
        <div style={{ fontSize:10, color:"#94a3b8", textAlign:"center", lineHeight:1.5 }}>
          JPG · PNG · PDF · DOC<br/>Max 1 file
        </div>

        <input ref={imgRef} type="file"
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          style={{ display:"none" }} onChange={handleImageChange} />
      </div>
      {/* ══ RIGHT — all form fields, fills same height ══ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"flex-start" }}>
      {/* Position + Supervisor — always 2 columns so supervisor slides in beside position */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"14px",  alignItems:"start" }}>
          {/* Left col — Position radio always visible */}
          <div>
            <Radio label="Position"
              options={["Supervisor Position","On Behalf of Supervisor"]}
              value={d.position} onChange={v=>s({...d,position:v})}
              error={errors.position} onClearError={()=>clearError("position")} />
          </div>
          {/* Right col — Supervisor Name slides in beside Position when selected */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}> </div>
          <div style={{ visibility: d.position==="On Behalf of Supervisor" ? "visible" : "hidden" }}>
            <Field label="Supervisor Name" required
              error={d.position==="On Behalf of Supervisor" ? errors.supervisorName : ""}>
              <TInput value={d.supervisorName||""}
                onChange={v=>{ s({...d,supervisorName:v}); clearError("supervisorName"); }}
                placeholder="Enter supervisor's full name"
                error={!!errors.supervisorName && d.position==="On Behalf of Supervisor"} />
            </Field>
          </div>
        </div>
        {/* Name row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
          <Field label="First Name" required error={errors.firstName}>
            <TInput value={d.firstName}
              onChange={v=>{ s({...d,firstName:v}); clearError("firstName"); }}
              placeholder="First" error={!!errors.firstName} />
          </Field>
          <Field label="Middle Name">
            <TInput value={d.middleName}
              onChange={v=>s({...d,middleName:v})} placeholder="Middle" />
          </Field>
          <Field label="Last Name" required error={errors.lastName}>
            <TInput value={d.lastName}
              onChange={v=>{ s({...d,lastName:v}); clearError("lastName"); }}
              placeholder="Last" error={!!errors.lastName} />
          </Field>
        </div>
{/* User Contact + Date of Joining */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
    alignItems: "start",
  }}>
  {/* Contact */}
  <Field label="User Contact" required error={errors.userContact}>
    <TInput
      value={d.userContact}
      onChange={v => {
        const digs = v.replace(/\D/g, "").slice(0, 10);
        s({ ...d, userContact: digs });
        clearError("userContact");
      }}
      placeholder="10-digit mobile number"
      error={!!errors.userContact}
      inputProps={{ inputMode: "numeric", maxLength: 10 }}
    />
  </Field>
  {/* Date of Joining */}
  <Field label="Date of Joining" required error={errors.dateOfJoining}>
    <input
      type="date"
      value={d.dateOfJoining}
      onChange={e => {
        s({ ...d, dateOfJoining: e.target.value });
        clearError("dateOfJoining");
      }}
      style={{
        ...inp,
        border: errors.dateOfJoining
          ? "1.5px solid #ef4444"
          : inp.border,
      }}
    />
  </Field>
</div>
        {/* Position + Supervisor */}
<div
  style={{
    marginTop: 4,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    alignItems: "start",
  }}
>
</div>
      </div>
    </div>
  );
}
// STEP 3 — Temporary/Permanent access type, validity only if Temporary
function Step3({ d, s, errors, clearError }) {
  const teams = d.location ? LOCATION_TEAMS[d.location] : [];

  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px",alignItems:"start" }}>
      <div>
        <div>
  {/* Location + Team */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    }}
  >
    <Field label="Location" required error={errors.location}>
      <TSelect
        value={d.location}
        onChange={v => {
          s({ ...d, location: v, team: "" });
          clearError("location");
        }}
        options={LOCATIONS}
        error={!!errors.location}
      />
    </Field>
    <Field label="Teams" required error={errors.team}>
      {d.location ? (
        <TSelect
          value={d.team}
          onChange={v => {
            s({ ...d, team: v });
            clearError("team");
          }}
          options={teams}
          error={!!errors.team}
        />
      ) : (
        <div
          style={{
            ...inp,
            color: "#94a3b8",
            background: "#f8fafc",
            cursor: "not-allowed",
            display: "flex",
            alignItems: "center",
          }}
        >
          — Select a location first —
        </div>
      )}
    </Field>
  </div>
  {/* Grade + Access Type */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    }}
  >
    <Field label="Grade" required error={errors.grade}>
      <TSelect
        value={d.grade}
        onChange={v => {
          s({ ...d, grade: v });
          clearError("grade");
        }}
        options={GRADES}
        error={!!errors.grade}
      />
    </Field>
    <Field label="Type of Access" required error={errors.accessType}>
      <TSelect
        value={d.accessType}
        onChange={v => {
          s({
            ...d,
            accessType: v,
            validityDate: v === "Permanent" ? "" : d.validityDate,
          });
          clearError("accessType");
        }}
        options={ACCESS_TYPES}
        error={!!errors.accessType}
      />
    </Field>
  </div>
  {/* Validity Date */}
  {d.accessType === "Temporary" && (
    <Field
      label="Validity Date Upto"
      required
      error={errors.validityDate}
    >
      <input
        type="date"
        value={d.validityDate}
        onChange={e => {
          s({ ...d, validityDate: e.target.value });
          clearError("validityDate");
        }}
        style={{
          ...inp,
          border: errors.validityDate
            ? "1.5px solid #ef4444"
            : inp.border,
        }}
      />
    </Field>
  )}
</div>
      </div>
      <div>
        <Field label="Additional Information">
          <textarea value={d.additionalInfo}
            onChange={e=>s({...d,additionalInfo:e.target.value})}
            rows={4} placeholder="Enter additional details..."
            style={{ ...inp,resize:"none" }} />
        </Field>
        <Radio label="Access Mode" options={["Pre Approved","Customized"]}
          value={d.accessMode} onChange={v=>s({...d,accessMode:v})}
          error={errors.accessMode} onClearError={()=>clearError("accessMode")} />
      </div>
    </div>
  );
}
// STEP 4 — Catalog: remove left checkbox column; only "Add to Cart" btn
function Step4({ d, s }) {
  const [tab,setTab]       = useState("catalog");
  const [search,setSearch] = useState("");

  // per-row draft state for catalog (role, startDate, endDate) before adding to cart
  const [drafts,setDrafts] = useState({});

  const cartItems = d.accessCart || [];
  const cartIds   = new Set(cartItems.map(i=>i.id));

  const setDraft = (id,field,val) =>
    setDrafts(prev=>({...prev,[id]:{...prev[id],[field]:val}}));

  const getDraft = (id) => drafts[id] || {role:"",startDate:"",endDate:"",remarks:""};

  const addToCart = (item) => {
    if (cartIds.has(item.id)) return;
    const dr = getDraft(item.id);
    s({...d, accessCart:[...cartItems,{...item,...dr}]});
    // clear draft after adding
    setDrafts(prev=>{ const n={...prev}; delete n[item.id]; return n; });
  };

  const removeFromCart = (id) => s({...d, accessCart:cartItems.filter(i=>i.id!==id)});

  const filtered = ACCESS_CATALOG.filter(a=>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const TAB = (active) => ({
    padding:"8px 18px", fontSize:13, fontWeight:600, cursor:"pointer",
    borderRadius:"8px 8px 0 0", border:"none", outline:"none",
    background:active?"#3b82f6":"#f1f5f9",
    color:active?"#fff":"#64748b",
    transition:"all 0.15s",
  });

  // Cart icon SVG
  const CartIcon = ({added}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={added?"#16a34a":"#3b82f6"} strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
  return (
    <div>
      {/* Tabs */}
      <div style={{ display:"flex",gap:4,marginBottom:0,alignItems:"flex-end" }}>
        <button type="button" style={TAB(tab==="catalog")} onClick={()=>setTab("catalog")}>
        Team / Application Specific Access
        </button>
        <button type="button" style={TAB(tab==="cart")} onClick={()=>setTab("cart")}>
        Access Cart
          <span style={{
            display:"inline-flex",alignItems:"center",justifyContent:"center",
            width:20,height:20,borderRadius:"50%",fontSize:11,fontWeight:700,
            background:tab==="cart"?"#fff":"#3b82f6",
            color:tab==="cart"?"#3b82f6":"#fff",
            marginLeft:6,
          }}>{cartItems.length}</span>
        </button>
      </div>
      <div style={{ border:"1.5px solid #e2e8f0",borderRadius:"0 8px 8px 8px",
        background:"#fff",minHeight:320 }}>
        {tab==="catalog" && (
          <div style={{ padding:16 }}>
            <div style={{ display:"flex",justifyContent:"space-between",
              alignItems:"center",marginBottom:14 }}>
              <p style={{ fontSize:13,color:"#64748b",margin:0 }}>
                * Fill role and dates, then click the cart icon to add
              </p>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search access..."
                style={{ ...inp,width:220,padding:"7px 12px",fontSize:13 }} />
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    {/* leftmost: cart action icon */}
                    <th style={{ ...TH,width:48,textAlign:"center" }}>Cart</th>
                    <th style={TH}>ID</th>
                    <th style={TH}>Name of Access</th>
                    <th style={TH}>Role</th>
                    <th style={TH}>Start Date</th>
                    <th style={TH}>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item,idx)=>{
                    const added = cartIds.has(item.id);
                    const dr    = getDraft(item.id);
                    return (
                      <tr key={item.id}
                        style={{ background:added?"#f0fdf4":idx%2===0?"#fff":"#f8fafc" }}>

                        {/* ── Cart icon button — leftmost ── */}
                        <td style={{ ...TD,textAlign:"center",width:48 }}>
                          <button
                            onClick={()=> added ? removeFromCart(item.id) : addToCart(item)}
                            title={added?"Remove from cart":"Add to cart"}
                            style={{
                              width:34,height:34,borderRadius:8,
                              border:`1.5px solid ${added?"#16a34a":"#3b82f6"}`,
                              background:added?"#dcfce7":"#eff6ff",
                              cursor:"pointer",
                              display:"inline-flex",alignItems:"center",
                              justifyContent:"center",
                              transition:"all 0.15s",
                            }}>
                            <CartIcon added={added}/>
                          </button>
                        </td>
                        <td style={{ ...TD,color:"#64748b",fontWeight:500 }}>{item.id}</td>
                        <td style={{ ...TD,fontWeight:600,color:"#1e293b",minWidth:220 }}>
                          {item.name}
                          {added && (
                            <span style={{ marginLeft:8,fontSize:10,fontWeight:700,
                              color:"#16a34a",background:"#dcfce7",
                              padding:"2px 7px",borderRadius:10 }}>✓ Added</span>
                          )}
                        </td>
                        {/* Role — editable in catalog, saved on add */}
                        <td style={{ ...TD,minWidth:140 }}>
                          <select
                            value={added
                              ? (cartItems.find(c=>c.id===item.id)?.role||"")
                              : dr.role}
                            onChange={e=>{
                              if(added){
                                // update directly in cart
                                s({...d, accessCart:cartItems.map(c=>
                                  c.id===item.id?{...c,role:e.target.value}:c)});
                              } else {
                                setDraft(item.id,"role",e.target.value);
                              }
                            }}
                            style={{ ...inp,padding:"5px 8px",fontSize:12,width:130 }}>
                            <option value="">Select</option>
                            {item.roles.map(r=><option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        {/* Start Date */}
                        <td style={{ ...TD,minWidth:135 }}>
                          <input type="date"
                            value={added
                              ? (cartItems.find(c=>c.id===item.id)?.startDate||"")
                              : dr.startDate}
                            onChange={e=>{
                              if(added){
                                s({...d, accessCart:cartItems.map(c=>
                                  c.id===item.id?{...c,startDate:e.target.value}:c)});
                              } else {
                                setDraft(item.id,"startDate",e.target.value);
                              }
                            }}
                            style={{ ...inp,padding:"5px 8px",fontSize:12,width:128 }} />
                        </td>

                        {/* End Date */}
                        <td style={{ ...TD,minWidth:135 }}>
                          <input type="date"
                            value={added
                              ? (cartItems.find(c=>c.id===item.id)?.endDate||"")
                              : dr.endDate}
                            onChange={e=>{
                              if(added){
                                s({...d, accessCart:cartItems.map(c=>
                                  c.id===item.id?{...c,endDate:e.target.value}:c)});
                              } else {
                                setDraft(item.id,"endDate",e.target.value);
                              }
                            }}
                            style={{ ...inp,padding:"5px 8px",fontSize:12,width:128 }} />
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length===0 && (
                    <tr><td colSpan={6}
                      style={{ ...TD,textAlign:"center",color:"#94a3b8",padding:32 }}>
                      No results found
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CART TAB */}
        {tab==="cart" && (
          <div style={{ padding:16 }}>
            <p style={{ fontSize:13,color:"#64748b",margin:"0 0 14px" }}>
              Items added to your cart. Go back to catalog to edit details.
            </p>
            {cartItems.length===0 ? (
              <div style={{ textAlign:"center",color:"#94a3b8",padding:48,fontSize:14 }}>
              Your cart is empty. Switch to the catalog tab to add access.
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      {["ID","Name of Access","Role","Start Date","End Date","Action"].map(h=>(
                        <th key={h} style={TH}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item,idx)=>(
                      <tr key={item.id} style={{ background:idx%2===0?"#fff":"#f8fafc" }}>
                        <td style={{ ...TD,color:"#64748b",fontWeight:500 }}>{item.id}</td>
                        <td style={{ ...TD,fontWeight:600,color:"#1e293b",maxWidth:240 }}>
                          {item.name}
                        </td>
                        {/* Role — read only display */}
                        <td style={TD}>
                          <span style={{
                            padding:"3px 10px",borderRadius:6,fontSize:12,fontWeight:600,
                            background: item.role?"#eff6ff":"#f8fafc",
                            color: item.role?"#2563eb":"#94a3b8",
                            border:`1px solid ${item.role?"#bfdbfe":"#e2e8f0"}`,
                          }}>
                            {item.role||"—"}
                          </span>
                        </td>
                        {/* Start Date — read only */}
                        <td style={{ ...TD,color:item.startDate?"#334155":"#94a3b8" }}>
                          {item.startDate||"—"}
                        </td>
                        {/* End Date — read only */}
                        <td style={{ ...TD,color:item.endDate?"#334155":"#94a3b8" }}>
                          {item.endDate||"—"}
                        </td>
                        {/* Remove action */}
                        <td style={TD}>
                          <button onClick={()=>removeFromCart(item.id)}
                            title="Remove from cart"
                            style={{
                              display:"inline-flex",alignItems:"center",gap:5,
                              padding:"5px 12px",borderRadius:7,border:"1px solid #fca5a5",
                              background:"#fff1f2",color:"#ef4444",cursor:"pointer",
                              fontSize:12,fontWeight:600,
                            }}>
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
// STEP 5 — Document Upload
function Step5({ d, s, errors, clearError }) {
  const handleFileChange = (e) => {
    const incoming = Array.from(e.target.files);
    const existingKeys = new Set(d.documents.map(f=>f.name+"_"+f.size));
    const uniqueNew = incoming.filter(f=>!existingKeys.has(f.name+"_"+f.size));
    if (uniqueNew.length < incoming.length)
      alert(`${incoming.length-uniqueNew.length} duplicate file(s) skipped.`);
    const merged = [...d.documents,...uniqueNew];
    if (merged.length>10){ alert("Maximum 10 files allowed."); return; }
    s({...d, documents:merged, documentNames:merged.map(f=>f.name)});
    clearError("documentName");
    e.target.value="";
  };
  const removeFile=(idx)=>{
    const updated=d.documents.filter((_,i)=>i!==idx);
    s({...d,documents:updated,documentNames:updated.map(f=>f.name)});
  };
  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",alignItems:"start" }}>
      <div>
        <Field label="Upload Document" required error={errors.documentName}>
          <label style={{ display:"flex",alignItems:"center",gap:12,padding:14,
            border:`1.5px dashed ${errors.documentName?"#ef4444":"#cbd5e1"}`,
            borderRadius:10,background:"#f8fafc",cursor:"pointer" }}>
            <div style={{ padding:"8px 16px",borderRadius:7,border:"1px solid #3b82f6",
              background:"#eff6ff",color:"#2563eb",fontWeight:600,fontSize:13,whiteSpace:"nowrap" }}>
              Choose File
            </div>
            <span style={{ fontSize:13,color:"#64748b" }}>
              {d.documentNames?.length>0 ? `${d.documentNames.length} file(s) selected` : "No file selected"}
            </span>
            <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.docx"
              style={{ display:"none" }} onChange={handleFileChange} />
          </label>
        </Field>
        {d.documentNames?.length>0 && (
          <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:4 }}>
            {d.documentNames.map((name,index)=>(
              <div key={index} style={{ display:"flex",justifyContent:"space-between",
                alignItems:"center",padding:"10px 12px",borderRadius:8,
                background:"#f8fafc",border:"1px solid #e2e8f0",fontSize:13 }}>
                <span style={{ wordBreak:"break-all",marginRight:8 }}>📄 {name}</span>
                <button onClick={()=>removeFile(index)}
                  style={{ border:"none",background:"#ef4444",color:"#fff",
                    padding:"4px 10px",borderRadius:6,cursor:"pointer",fontSize:12,flexShrink:0 }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <Field label="Selected File Name">
          <div style={{ padding:12,borderRadius:8,background:"#f8fafc",
            border:"1px solid #e2e8f0",fontSize:14,color:"#334155",minHeight:44 }}>
            {d.documentNames?.length>0 ? d.documentNames.join(", ") : "No file selected"}
          </div>
        </Field>
      </div>
    </div>
  );
}

// STEP 6 — Approval table: approver 1 = Approved, approver 2 = Pending
const APPROVERS = [
  { id:"EP122", name:"Intikhab Alam",  dept:"ITSS",   initials:"IA", color:"#3b82f6",
    status:"Approved",  statusBg:"#dcfce7", statusColor:"#166534" },
  { id:"EP123", name:"Sandip Nag",  dept:"ITSS", initials:"SN", color:"#8b5cf6",
    status:"Pending",   statusBg:"#fef9c3", statusColor:"#854d0e" },
];

function Step6() {
  return (
    <div>
      <div style={{ padding:"14px 16px",borderRadius:10,background:"#eff6ff",
        border:"1px solid #bfdbfe",marginBottom:24,color:"#1d4ed8",fontWeight:600 }}>
        The following approvers will review your onboarding request.
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:14 }}>
          <thead>
            <tr style={{ background:"#f8fafc" }}>
              {["Approver ID","Approver","Description","Department","Status"].map(h=>(
                <th key={h} style={{ ...TH,fontSize:13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {APPROVERS.map((a,idx)=>(
              <tr key={a.id} style={{ background:idx%2===0?"#fff":"#f8fafc" }}>
                <td style={{ ...TD,fontWeight:600,color:"#3b82f6",whiteSpace:"nowrap" }}>{a.id}</td>
                <td style={TD}>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:44,height:44,borderRadius:"50%",flexShrink:0,
                      background:a.color,color:"#fff",display:"flex",alignItems:"center",
                      justifyContent:"center",fontWeight:700,fontSize:15,letterSpacing:1,
                      boxShadow:"0 2px 6px rgba(0,0,0,0.12)" }}>{a.initials}</div>
                    <div>
                      <div style={{ fontWeight:600,color:"#1e293b" }}>{a.name}</div>
                      <div style={{ fontSize:12,color:"#64748b" }}>{a.dept}</div>
                    </div>
                  </div>
                </td>
                <td style={{ ...TD,color:"#475569",maxWidth:300,lineHeight:1.5 }}>
                  {idx===0
                    ? "Software Developer"
                    : "Software Developer"}
                </td>
                <td style={{ ...TD,color:"#334155" }}>{a.dept}</td>
                <td style={TD}>
                  {/* FIX: approver 1 = Approved green, approver 2 = Pending yellow */}
                  <span style={{ padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:600,
                    background:a.statusBg,color:a.statusColor }}>
                    {a.status==="Approved" }{a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// STEP 7 — Review with accordion dropdowns
function Step7({ s1, s2, s3, s4, s5 }) {
  const [open,setOpen] = useState({ s1:true,s2:false,s3:false,s4:false,s5:false });
  const toggle = (key) => {
    const scrollY = window.scrollY;
    setOpen(p => ({...p,[key]:!p[key]}));
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "instant" });
    });
  };
  const Row = ({label,value}) => (
    <div style={{ display:"grid",gridTemplateColumns:"180px 1fr",gap:8,marginBottom:10 }}>
      <div style={{ fontSize:12,color:"#64748b",fontWeight:600,paddingTop:2 }}>{label}</div>
      <div style={{ padding:"8px 12px",borderRadius:7,border:"1px solid #e2e8f0",
        background:"#f8fafc",fontSize:13,color:value?"#1e293b":"#94a3b8" }}>{value||"—"}</div>
    </div>
  );
  const Section = ({skey,title,icon,children}) => (
    <div style={{ marginBottom:10,border:"1.5px solid #e2e8f0",borderRadius:10,overflow:"hidden" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={e=>{ e.preventDefault(); e.stopPropagation(); toggle(skey); }}
        onMouseDown={e=>e.preventDefault()}
        onKeyDown={e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggle(skey); }}}
        style={{
          width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"13px 18px", background:open[skey]?"#eff6ff":"#f8fafc",
          cursor:"pointer", fontSize:14, fontWeight:700,
          color:open[skey]?"#1d4ed8":"#334155",
          userSelect:"none", boxSizing:"border-box",
          WebkitTapHighlightColor:"transparent",
          outline:"none",
        }}>
        <span>{icon} {title}</span>
        <span style={{
          fontSize:20, display:"inline-block", lineHeight:1,
          transition:"transform 0.22s ease",
          transform:open[skey]?"rotate(180deg)":"rotate(0deg)",
        }}>⌄</span>
      </div>
      {open[skey] && (
        <div style={{ padding:"16px 18px",borderTop:"1.5px solid #e2e8f0",background:"#fff" }}>
          {children}
        </div>
      )}
    </div>
  );
  return (
    <div>
      <div style={{ padding:"14px 16px",borderRadius:10,background:"#eff6ff",
        border:"1px solid #bfdbfe",marginBottom:18,color:"#1d4ed8",fontWeight:600,fontSize:14 }}>
        Review all details below before final submission. Click each section to expand.
      </div>
      <Section skey="s1" title="Joining Type">
        <Row label="Division"     value={s1.division} />
        <Row label="Joining Type" value={s1.joiningType} />
        <Row label="Type"         value={s1.type} />
        <Row label="Sub-Type"     value={s1.subtype} />
        <Row label="Login ID"     value={s1.loginId} />
      </Section>
      <Section skey="s2" title="Basic Information">
        <div style={{ display:"flex",alignItems:"flex-start",gap:20,marginBottom:14 }}>
          {s2.profileImagePreview && s2.profileImagePreview!=="__doc__"
            ? <img src={s2.profileImagePreview} alt="profile"
                style={{ width:80,height:96,borderRadius:8,objectFit:"cover",
                  border:"2.5px solid #3b82f6",flexShrink:0,
                  boxShadow:"0 2px 10px rgba(59,130,246,0.2)" }} />
            : s2.profileImagePreview==="__doc__"
            ? <div style={{ width:80,height:96,borderRadius:8,background:"#f1f5f9",
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                border:"1.5px solid #e2e8f0",flexShrink:0,gap:4 }}>
                <span style={{ fontSize:28 }}></span>
                <span style={{ fontSize:9,color:"#64748b" }}>Document</span>
              </div>
            : <div style={{ width:80,height:96,borderRadius:8,background:"#eef2f7",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:36,flexShrink:0,border:"1.5px dashed #cbd5e1" }}></div>
          }
          <div style={{ flex:1 }}>
            <Row label="Position"   value={s2.position} />
            <Row label="Supervisor" value={s2.supervisorName} />
          </div>
        </div>
        <Row label="First Name"     value={s2.firstName} />
        <Row label="Middle Name"    value={s2.middleName} />
        <Row label="Last Name"      value={s2.lastName} />
        <Row label="Mobile"         value={s2.userContact} />
        <Row label="Date of Joining" value={s2.dateOfJoining} />
      </Section>
      <Section skey="s3" title="User Identity">
        <Row label="Location"      value={s3.location} />
        <Row label="Team"          value={s3.team} />
        <Row label="Grade"         value={s3.grade} />
        <Row label="Access Type"   value={s3.accessType} />
        {s3.accessType==="Temporary" && <Row label="Validity Date" value={s3.validityDate} />}
        <Row label="Access Mode"   value={s3.accessMode} />
        <Row label="Additional Info" value={s3.additionalInfo} />
      </Section>
      <Section skey="s4" title="Access Requirements" >
        {(!s4.accessCart||s4.accessCart.length===0)
          ? <div style={{ color:"#94a3b8",fontSize:13 }}>No access items added.</div>
          : <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    {["ID","Name of Access","Role","Start Date","End Date","Remarks"].map(h=>(
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s4.accessCart.map((item,idx)=>(
                    <tr key={item.id} style={{ background:idx%2===0?"#fff":"#f8fafc" }}>
                      <td style={TD}>{item.id}</td>
                      <td style={{ ...TD,fontWeight:500 }}>{item.name}</td>
                      <td style={TD}>{item.role||"—"}</td>
                      <td style={TD}>{item.startDate||"—"}</td>
                      <td style={TD}>{item.endDate||"—"}</td>
                      <td style={TD}>{item.remarks||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </Section>
      <Section skey="s5" title="Uploaded Documents">
        {(!s5.documentNames||s5.documentNames.length===0)
          ? <div style={{ color:"#94a3b8",fontSize:13 }}>No documents uploaded.</div>
          : s5.documentNames.map((n,i)=>(
              <div key={i} style={{ padding:"8px 12px",borderRadius:7,border:"1px solid #e2e8f0",
                background:"#f8fafc",fontSize:13,marginBottom:6 }}> {n}</div>
            ))
        }
      </Section>
    </div>
  );
}
// SUCCESS
function SuccessScreen({ onReset }) {
  return (
    <div style={{ minHeight:"100vh",background:"#f1f5f9",display:"flex",
      alignItems:"center",justifyContent:"center",padding:16,
      fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background:"#fff",borderRadius:20,padding:"48px 56px",
        boxShadow:"0 4px 24px rgba(0,0,0,0.08)",textAlign:"center",maxWidth:480,width:"100%" }}>
        <div style={{ fontSize:64,marginBottom:16 }}>:)</div>
        <h2 style={{ fontSize:24,fontWeight:700,color:"#0f172a",margin:"0 0 12px" }}>
          Request Submitted!
        </h2>
        <p style={{ color:"#64748b",fontSize:15,margin:"0 0 32px",lineHeight:1.6 }}>
        Your employee onboarding request has been submitted and is pending approval.
        </p>
        <button onClick={onReset} style={{ padding:"12px 32px",borderRadius:10,fontSize:15,
          fontWeight:600,cursor:"pointer",border:"none",background:"#3b82f6",
          color:"#fff",width:"100%" }}>
          Submit Another Request
        </button>
      </div>
    </div>
  );
}
// MAIN
export default function EmployeeOnboarding() {
  const [step,setStep]               = useState(1);
  const [done,setDone]               = useState(false);
  const [submitting,setSubmitting]   = useState(false);
  const [errors,setErrors]           = useState({});
  const { getToken } = useAuth();
  const [s1,setS1] = useState({ division:"",joiningType:"",type:"",subtype:"",loginId:"" });
  const [s2,setS2] = useState({ position:"",supervisorName:"",firstName:"",middleName:"",
    lastName:"",userContact:"",dateOfJoining:"",profileImage:null,profileImagePreview:"" });
  const [s3,setS3] = useState({ location:"",team:"",grade:"",accessType:"",
    validityDate:"",additionalInfo:"",accessMode:"" });
  const [s4,setS4] = useState({
  accessCart: [
    {
      id: 1537,
      name: "Sahayak",
      role: "",
      startDate: "",
      endDate: "",
      remarks: "",
    },
    {
      id: 1544,
      name: "Network Login ID - Individual (AD Access)",
      role: "",
      startDate: "",
      endDate: "",
      remarks: "",
    },
  ],
});
  const [s5,setS5] = useState({ documents:[],documentNames:[] });
  const clearError = (key) => setErrors(prev=>{
    if (!prev[key]) return prev;
    const n={...prev}; delete n[key]; return n;
  });
  const handleReset = () => {
    setStep(1); setDone(false); setErrors({});
    setS1({ division:"",joiningType:"",type:"",subtype:"",loginId:"" });
    setS2({ position:"",supervisorName:"",firstName:"",middleName:"",
      lastName:"",userContact:"",dateOfJoining:"",profileImage:null,profileImagePreview:"" });
    setS3({ location:"",team:"",grade:"",accessType:"",validityDate:"",additionalInfo:"",accessMode:"" });
    setS4({ accessCart:[] });
    setS5({ documents:[],documentNames:[] });
  };
  const validate = () => {
    const e = {};
    if (step===1) {
      if (!s1.division)    e.division    = "Division is required";
      if (!s1.joiningType) e.joiningType = "Joining type is required";
      if (!s1.type)        e.type        = "Type is required";
      if (!s1.loginId)     e.loginId     = "Login ID is required";
      // block continue if login ID exists
      if (s1.loginId && EXISTING_LOGIN_IDS.includes(s1.loginId.toLowerCase().trim()))
        e.loginId = "This Login ID already exists in the system";
    }
    if (step===2) {
      if (!s2.position)      e.position      = "Position is required";
      if (!s2.firstName)     e.firstName     = "First name is required";
      if (!s2.lastName)      e.lastName      = "Last name is required";
      if (!s2.userContact)   e.userContact   = "Mobile number is required";
      else if (s2.userContact.length!==10) e.userContact = "Must be exactly 10 digits";
      if (!s2.dateOfJoining) e.dateOfJoining = "Date of joining is required";
      if (s2.position==="On Behalf of Supervisor" && !s2.supervisorName)
        e.supervisorName = "Supervisor name is required";
    }
    if (step===3) {
      if (!s3.location)   e.location   = "Location is required";
      if (!s3.team)       e.team       = "Team is required";
      if (!s3.grade)      e.grade      = "Grade is required";
      if (!s3.accessType) e.accessType = "Access type is required";
      // validity date only required for Temporary
      if (s3.accessType==="Temporary" && !s3.validityDate) e.validityDate = "Validity date is required";
      if (!s3.accessMode) e.accessMode = "Access Mode is Required";
    }
    if (step===5) {
      if (s5.documents.length===0) e.documentName = "At least one document is required";
    }
    return e;
  };
  const handleContinue = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length>0) return;
    setErrors({});
    setStep(s=>s+1);
  };
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries({...s1,...s2,...s3}).forEach(([k,v])=>{
        if (k!=="profileImage" && k!=="profileImagePreview") formData.append(k,v??"");
      });
      if (s2.profileImage) formData.append("profileImage",s2.profileImage);
      formData.append("accessCart",JSON.stringify(s4.accessCart));
      s5.documents.forEach(file=>formData.append("documents",file));
      
      const res = await fetch("http://localhost:5000/submit", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
  body: formData,
});
      const data = await res.json();
      if (data.success) setDone(true);
      else alert("Submission failed: "+(data.message||"Unknown error"));
    } catch {
      alert("Could not reach the server. Please ensure it is running on port 5000.");
    } finally {
      setSubmitting(false);
    }
  };
  if (done) return <SuccessScreen onReset={handleReset} />;
  return (
    <div style={{ minHeight:"100vh",background:"#f1f5f9",padding:"12px",
      fontFamily:"'Segoe UI', system-ui, sans-serif",overflowY:"auto" }}>
      <div style={{ maxWidth:"1400px",margin:"0 auto" }}>
        {/* Header */}
        <div style={{ textAlign:"center",marginBottom:28 }}>
          <h1 style={{ fontSize:26,fontWeight:700,margin:0,color:"#0f172a" }}>
            Employee Onboarding Request
          </h1>
          <p style={{ color:"#64748b",fontSize:14,marginTop:6,marginBottom:0 }}>
            Complete all {STEPS.length} steps to submit your access request
          </p>
        </div>
        {/* Stepper */}
        <div style={{ display:"flex",alignItems:"flex-start",marginBottom:28,overflowX:"auto",paddingBottom:4 }}>
          {STEPS.map((st,i)=>{
            const completed=step>st.id, active=step===st.id;
            return (
              <div key={st.id} style={{ display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:"none" }}>
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center",
                  cursor:completed?"pointer":"default",flexShrink:0 }}
                  onClick={()=>completed&&setStep(st.id)}>
                  <div style={{ width:38,height:38,borderRadius:"50%",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:700,fontSize:14,transition:"all 0.3s",
                    background:completed?"#16a34a":active?"#3b82f6":"#fff",
                    color:completed||active?"#fff":"#94a3b8",
                    border:completed?"2px solid #16a34a":active?"2px solid #3b82f6":"2px solid #e2e8f0",
                    boxShadow:active?"0 0 0 4px #bfdbfe":"none" }}>
                    {completed
                      ? <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                          <path d="M1.5 7L6 11.5L14.5 2" stroke="white" strokeWidth="2.2"
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      : st.id}
                  </div>
                  <div style={{ fontSize:10,fontWeight:active?700:500,marginTop:6,
                    textAlign:"center",whiteSpace:"nowrap",
                    color:completed?"#16a34a":active?"#3b82f6":"#94a3b8" }}>
                    {st.label}
                  </div>
                </div>
                {i<STEPS.length-1 && (
                  <div style={{ flex:1,height:2,marginBottom:20,marginLeft:4,marginRight:4,
                    background:completed?"#16a34a":"#e2e8f0",transition:"background 0.3s",minWidth:8 }} />
                )}
              </div>
            );
          })}
        </div>
        {/* Card */}
        <div style={{ background:"#fff",borderRadius:16,border:"1.5px solid #e2e8f0",
          padding:"28px 32px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize:18,fontWeight:700,margin:"0 0 22px",color:"#0f172a",
            paddingBottom:16,borderBottom:"1.5px solid #f1f5f9" }}>
            Step {step} — {STEPS[step-1].label}
          </h2>
          {step===1 && <Step1 d={s1} s={setS1} errors={errors} clearError={clearError} />}
          {step===2 && <Step2 d={s2} s={setS2} errors={errors} clearError={clearError} />}
          {step===3 && <Step3 d={s3} s={setS3} errors={errors} clearError={clearError} />}
          {step===4 && <Step4 d={s4} s={setS4} />}
          {step===5 && <Step5 d={s5} s={setS5} errors={errors} clearError={clearError} />}
          {step===6 && <Step6 />}
          {step===7 && <Step7 s1={s1} s2={s2} s3={s3} s4={s4} s5={s5} />}
          {/* Nav */}
          <div style={{ display:"flex",justifyContent:"space-between",
            marginTop:28,paddingTop:20,borderTop:"1.5px solid #f1f5f9" }}>
            {step>1
              ? <button onClick={()=>{ setErrors({}); setStep(s=>s-1); }}
                  style={{ padding:"10px 24px",borderRadius:8,fontSize:14,fontWeight:600,
                    cursor:"pointer",border:"1.5px solid #e2e8f0",background:"#fff",color:"#334155" }}>
                  ← Back
                </button>
              : <div />
            }
            {step<STEPS.length
              ? <button onClick={handleContinue}
                  style={{ padding:"10px 28px",borderRadius:8,fontSize:14,fontWeight:600,
                    cursor:"pointer",border:"none",background:"#3b82f6",color:"#fff" }}>
                  Continue →
                </button>
              : <button onClick={handleSubmit} disabled={submitting}
                  style={{ padding:"10px 28px",borderRadius:8,fontSize:14,fontWeight:600,
                    cursor:submitting?"not-allowed":"pointer",border:"none",
                    background:submitting?"#86efac":"#16a34a",color:"#fff",
                    opacity:submitting?0.8:1,minWidth:160 }}>
                  {submitting?"Submitting…":"Submit Request ✓"}
                </button>
            }
          </div>
        </div>
        <p style={{ textAlign:"center",marginTop:14,fontSize:12,color:"#94a3b8" }}>
        Step {step} of {STEPS.length} · {STEPS[step-1].label}
        </p>
      </div>
    </div>
  );
}