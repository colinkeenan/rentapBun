import {useRef} from "react"

const rGray = '#57606F';
const rDisabled = '#b4cefb'
const rLightBlue = '#77aaff'
const requiredFields = ["FullName", "dateApplied"]; // possibilities: FullName, SSN, BirthDate, Email, StateID, Phone1, Phone2, dateApplied, dateStart, dateStop
//each fieldset acts like a column
//set all columns next to each other if possible
const fieldsetStyle={display:'inline-block', width:'425px', border:'none'};
//other styles defined inline or in functions that follow this Rentap function

export function EditHeaders ({headers, icon, message, editOption}: {headers:{[key:string]:any}, icon:string, message:string, editOption:string}) {
  const headerNames = headers.map((header:any) => header.Name);
  const encodedOptions = headerNames.map((name:any) => encodeURIComponent(name).replaceAll('%20','+'));
  headerNames[0] = "Select Option to Edit"
  const editRow = editOption ? encodedOptions.indexOf(editOption) : 0;
  return (
    <>
      <meta charSet="utf-8" />
      <title>Rentap Options</title>
      <link rel="icon" href={`data:image/x-icon;base64,${icon}`} />
      <header>
        <a href='/view'><img src={`data:image/png;base64,${icon}`} alt="Rentap Icon" /></a>
        <div style={{display:'inline-block', fontWeight:'bold', color:'blue'}}> {message} </div>
      </header>
      <body style={{backgroundColor:rLightBlue}} >
        <h3 style={{backgroundColor:'darkblue', color:'white', textAlign:'center', maxWidth:'1500'}}>'Applying for:' Options</h3>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Delete Option</legend>
          <form action="/delheader" method="post" >
            <input type="submit" defaultValue="X" style={{backgroundColor:'darkred', color:'white'}} />
            <Field type= "number" name="Row" placeholder="Row" width="20%" viewOnly={false} />
          </form>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Edit Option</legend>
          <form action="/editheader" method="post">
            <select name="select" id="select" style={{width:'60%'}}  value={headerNames[editRow]} onChange={function(){}} >
              {headerNames.map( (name:string) => <option value={name} key={name}>{name}</option> )}
            </select>
            <input type="submit" defaultValue="Edit" style={{backgroundColor:'darkblue', color:'white'}} />
          </form>
          <form action="/saveheader" method="post" encType="multipart/form-data" >
            <input type="submit" defaultValue="Save" style={{backgroundColor:'darkblue', color:'white'}} />
            <Field type= "text" name="Name" placeholder="" width="50%" ap={headers[editRow]} viewOnly={true} />
            <Field type= "text" name="StreetAddress" placeholder="Street Address" width="75%" ap={headers[editRow]} viewOnly={false} />
            <Field type= "text" name="CityStateZip" placeholder="City State Zip" width="75%" ap={headers[editRow]} viewOnly={false} />
            <Field type= "text" name="Title" placeholder="Title" width="75%" ap={headers[editRow]} viewOnly={false} />
          </form>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Add Option</legend>
          <form action="/addheader" method="post" >
            <input type="submit" defaultValue="+" style={{backgroundColor:'darkblue', color:'white'}} />
            <Field type= "text" name="Name" placeholder="Unique Option Name" width="50%" viewOnly={false} />
            <Field type= "text" name="StreetAddress" placeholder="Street Address" width="75%" viewOnly={false} />
            <Field type= "text" name="CityStateZip" placeholder="City State Zip" width="75%" viewOnly={false} />
            <Field type= "text" name="Title" placeholder="Title" width="75%" viewOnly={false} />
          </form>
        </fieldset>
        <table style={{backgroundColor:'black'}}>
          <thead>
            <tr> <Th text="Row" /> <Th text="Unique Option Name" /> <Th text="Street Address" /> <Th text="City State Zip" /> <Th text="Title" /> </tr>
          </thead>
          <tbody> {
            headers.map (
              (h:any) => h.Name && //skip headers[0] which has all blank entries
              <tr key={h.Name}>
                <TdR text={headers.indexOf(h)} /> <Td text={h.Name} /> <Td text={h.StreetAddress} /> <Td text={h.CityStateZip} /> <Td text={h.Title} />
              </tr>
            )
          } </tbody>
        </table>
      </body>
    </>
  )
}

export function Rentap({message, viewOnly, icon, ap, searchField, foundFullNames, apID, header, headerNames, inTrash }:
  {message:string, viewOnly:boolean, inTrash:boolean
    icon:string, ap:{[key:string]:any}, searchField:string, foundFullNames:Array<string>
   apID:number, header:{[key:string]:any}, headerNames:Array<string>} ) {

  // when toggling Sort/Unsort button, check whether or not "Sorted:" was inserted at top of list
  const sorted = foundFullNames[0].substring(0,7) === "Sorted:";

  return (
    <>
      <meta charSet="utf-8" />
      <title>Rentap</title>
      <link rel="icon" href={`data:image/x-icon;base64,${icon}`} />
      <header>
        <div style={{display:'flex', minHeight:'76px', border:'8px solid white', minWidth:'425px', maxWidth:'1374px'}} >
          <div style={{flex:'grow', textAlign:'center', backgroundColor:'darkred', width:'70px'}} >
            <a href='/view' ><img src={`data:image/png;base64,${icon}`} alt="Rentap Icon" style={{marginTop:'12'}} /></a>
          </div>
          <div style={{flex: 1, alignItems:'center', minHeight:'54px', fontWeight:'bold', textAlign:'center', backgroundColor:'darkblue', color:'white' }}>
            <p> {message} </p>
          </div>
        </div>
        <br/><br/>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Applying for:</legend>
          <form action="/selectapplyingfor" method="post" encType="multipart/form-data" style={{margin:'0', marginBottom:'5'}} >
            <select name="selectApplyingFor" id="selectapplyingfor" style={{ display:'inline-block', width:'73%' }} value={header.Name} onChange={function(){}} required>
              {headerNames.map( (name:string) => <option value={name} key={name}>{name}</option> )}
            </select>
            <input type="submit" defaultValue="Update" style={{backgroundColor:'darkblue', color:'white'}} />
          </form>
          <h3 style={{margin:'0', color:rGray}}>{header.Title ? header.Title : "Title"}</h3>
          <p style={{margin:'0', color:rGray}}>
          {header.StreetAddress ? header.StreetAddress : "Street Address"}
          <br/> {header.CityStateZip ? header.CityStateZip : "City, ST Zip"}
          </p>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Actions</legend>
          <div style={{width:'100%', marginBottom:'5px', display:'flex', justifyContent:'space-between'}}>
            <a href={apID ? (viewOnly?'/edit':'/view') : '/' } >
              <button type="button" style={{backgroundColor:'darkblue', color:'white', fontWeight:'bold' }} >
                {apID ? (viewOnly?'Edit':'View') : 'New'}
              </button>
            </a>
            <div>
              <a href={inTrash ? "/restore" : "/discard"} ><button type="button" style={{backgroundColor:rGray, color:'white' }} >{inTrash ? "Restore" : "Discard"}</button></a>
              <div style={{backgroundColor:'gray', color:'white', textAlign:'center', display:'inline-block'}}>{'||'}</div>
              <a href={inTrash ? "/exittrash" : "/trash"} ><button type="button" style={{backgroundColor:rGray, color:'white' }} >{inTrash ? "Exit Trash" : "View Discarded"}</button></a>
            </div>
          </div>
          <div style={{width:'100%', display:'flex', justifyContent:'space-between'}}>
            <a href="/"     ><button type="button" style={{backgroundColor:'darkblue', color:'white', fontWeight:'bold' }} >New</button></a>
            <a href={inTrash ? "/delete" : "/editheaders"} ><button type="button" style={{backgroundColor:inTrash ? 'darkred' : rGray, color:'white'}} >
              {inTrash ? "Delete (This is Permanent)" : "Edit 'Applying for:' Options"}</button></a>
          </div>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Navigation</legend>
          <form action="/search" method="post" encType="multipart/form-data" style={{margin:'0', marginBottom:'5'}} >
            <Label forId='searchFields' labelText="Search Field(s)" />
            <select name="searchFields" id="searchfields" value={searchField} style={{width:'73%', marginLeft:'8', marginBottom:'2' }} onChange={function(){}} >
              <option value="selectSearchFields" key="selectSearchFields"> ALL  or [ Select field to search ]</option>
              {Object.keys(ap).map( (key:string) => <option value={key} key={key}>{camelCaseToWords(key)}</option> )}
            </select>
            <div style={{display:'flex', justifyContent:'space-between'}} >
              <div>
                <a href="/prev" ><button type="button" style={{backgroundColor:rGray, color:'white' }} >&lt;</button></a>
                <div style={{backgroundColor:rDisabled, textAlign:'center', display:'inline-block', width:'80px' }}>{apID}</div>
                <a href="/next" ><button type="button" style={{backgroundColor:rGray, color:'white' }} >&gt;</button></a>
              </div>
              <input type="text" name="search" id="search" placeholder="search" style={{width:'65%'}} />
            </div>
          </form>
          <form action="/select" method="post" style={{margin:'0'}}>
            <div style={{width:'100%', display:'flex', justifyContent:'space-between'}}>
              <a href="/sort" ><button type="button" style={{backgroundColor:rGray, color:'white' }} >{sorted ? "Unsort" : "Sort"}</button></a>
              <select name="select" id="select" value={ap.FullName ? ap.FullName : foundFullNames[0]} style={{width:'58%'}} onChange={function(){}} >
                {foundFullNames.map( (name:any) => <option value={name} key={name}>{name}</option> )}
              </select>
              <input type="submit" defaultValue="View" style={{backgroundColor:'darkblue', color:'white'}} />
            </div>
          </form>
        </fieldset>
      </header>
      <body style={{backgroundColor:rLightBlue}} >
      <form action="/save" method="post" encType="multipart/form-data" >
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Identity</legend>
          <Label forId="fullname"  labelText="Full Name" />     <Field type="text"  name="FullName"      placeholder="First Middle Last" width='73%' ap={ap} viewOnly={viewOnly} />
          <Label forId="ssn"  labelText="Social Security" />    <Field type="text"  name="SSN"           placeholder="555-55-5555" width='73%' ap={ap} viewOnly={viewOnly} />
          <Label forId="birthdate" labelText="Birth Date" />    <Field type="date"  name="BirthDate"     placeholder="" width='36.5%' ap={ap} viewOnly={viewOnly} />
                                                                <Field type="text"  name="MaritalStatus" placeholder="Marital Status" width='36.5%' ap={ap} viewOnly={viewOnly} />
          <Label forId="email" labelText="Email" />             <Field type="email" name="Email"         placeholder="youremail@provider.com" width='73%' ap={ap} viewOnly={viewOnly} />
          <Label forId="stateid" labelText="State ID#" />       <Field type="text"  name="StateID"       placeholder="MO 123456789 1/2/2034" width='73%' ap={ap} viewOnly={viewOnly} />
          <Label forId="phone1" labelText="Phones" />           <Field type="tel"   name="Phone1"        placeholder="Phone 1" width='36.5%' ap={ap} viewOnly={viewOnly} />
                                                                <Field type="tel"   name="Phone2"        placeholder="Phone 2" width='36.5%' ap={ap} viewOnly={viewOnly} />
          <TextArea rows={5}  name="CurrentAddress"    placeholder="Address, City, State, Zip, Dates, Rent, Landlord name and phone number" ap={ap} viewOnly={viewOnly} />
          <TextArea rows={16} name="PriorAddresses"    placeholder="Prior Addresses, Cities, States, Zips, Dates, Rents, Landlords" ap={ap} viewOnly={viewOnly} />
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Situation</legend>
          <Label forId="headername" labelText="Applying for:" />
            <select name="headerName" id="headername"
              style={{width:'73%', marginLeft:'8', marginBottom:'2',  }}
              value={header.Name} onChange={function(){}} disabled={viewOnly} required>
              {headerNames.map( (name:string) => <option value={name} key={name}>{name}</option> )}
            </select>
          <TextArea rows={5}  name="ProposedOccupants" placeholder="Proposed Occupants: self+age, other+age" ap={ap} viewOnly={viewOnly} />
          <TextArea rows={3}  name="ProposedPets"      placeholder="Proposed Pets, names, types, ages, weights" ap={ap} viewOnly={viewOnly} />
          <TextArea rows={6}  name="Income"            placeholder="Income amount and source" ap={ap} viewOnly={viewOnly} />
          <TextArea rows={14} name="Employment"        placeholder="Employment: address, job/position, dates, hours, supervisor name and phone number" ap={ap} viewOnly={viewOnly} />
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Criminal &amp; Civil Record | Notes</legend>
          <TextArea rows={15} name="Evictions"         placeholder="Evictions Past 10 Years, or other notes" ap={ap} viewOnly={viewOnly} />
          <TextArea rows={15} name="Felonies"          placeholder="Felonies/Drug Convictions, or other notes" ap={ap} viewOnly={viewOnly} />
        </fieldset>
        <br />
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Agreement Dates</legend>
          <Label forId="datestart" labelText="Start | Stop"/> <Field type="date" name="dateStart" placeholder="" width='36%' ap={ap} viewOnly={viewOnly} />
                                                              <Field type="date" name="dateStop"  placeholder="" width='36%' ap={ap} viewOnly={viewOnly} />
        </fieldset>
        <Label forId="dateapplied" labelText="Applied"/> <Field type="date" name="dateApplied" placeholder="" width='auto' ap={ap} viewOnly={viewOnly} />
        {viewOnly ? "" : <input type="submit" defaultValue="Save" style={{backgroundColor:'darkblue', color:'white', marginLeft:'15px'}} />}
      </form>
      </body>
    </>
  );
}

function Label({forId, labelText}: {forId:string, labelText:string}) {
  return (
    <label htmlFor={forId} style={{width:'106px', display:'inline-block', color:'white', textAlign:'right', fontSize:'14px'}} > {labelText} </label>
  )
}

function Field({type, name, placeholder, width, ap, viewOnly}: { type: string, name: string, placeholder: string, width: string, ap?: {[key:string]: any}, viewOnly: boolean }) {
  const required = requiredFields.some((r:string) => r === name);
  return (
    <input type={type} name={name} id={name.toLowerCase()} placeholder={placeholder}
      style={{width:width, marginBottom:2, backgroundColor:viewOnly?rDisabled:'white'}}
      value={ap ? ap[name] : ""} readOnly={viewOnly} onChange={function(){}} required={required} />
  )
}

function TextArea({rows, name, placeholder, ap, viewOnly}: { rows:number, name:string, placeholder:string, ap: {[key:string]: any}, viewOnly: boolean }) {
  return (
    <textarea rows={rows} name={name} placeholder={placeholder}
      style={{width:'100%', marginBottom:2, backgroundColor:viewOnly?rDisabled:'white'}}
      defaultValue={ap[name]} readOnly={viewOnly} onChange={function(){}} />
  )
}

const cellStyle={backgroundColor:rDisabled, paddingLeft:'10', paddingRight:'10'}

function Td({text}:{text:string}) {
  return (
    <td style={cellStyle}>{text}</td>
  )
}

function TdR({text}:{text:string}) {
  return (
    <td style={{backgroundColor:rDisabled, paddingLeft:'10', paddingRight:'10', textAlign:'right'}}>{text}</td>
  )
}

function Th({text}:{text:string}) {
  return (
    <th style={cellStyle}>{text}</th>
  )
}

function camelCaseToWords(s:string) {
  let str = s
  .replace(/([a-z])([A-Z])/g, '$1 $2') // replaces FullName with Full Name
  .replace(/([a-zA-Z])([0-9])/g, '$1 $2') // replaces Phone1 with Phone 1
  .replace(/^./, m => m.toUpperCase()); // uppercases first letter
  if (str==='SSN') str='Social Security'
  if (str==='Header Name') str='Applying For:'
  return str;
}

function selectHeaderToEdit (editRow:number, headerNames:Array<string>) {
  const selectForm = useRef(null)
  const handleSubmit = () => {selectForm.current.submit()}
  return (
    <form ref={selectForm} action="/editheader" method="post" onChange={handleSubmit}>
      <select name="select" id="select" style={{width:'60%'}}  value={headerNames[editRow]} onChange={handleSubmit} >
        {headerNames.map( (name:string) => <option value={name} key={name}>{name}</option> )}
      </select>
      <input type="submit" defaultValue="Edit" style={{backgroundColor:'darkblue', color:'white'}} />
    </form>
  )
}
