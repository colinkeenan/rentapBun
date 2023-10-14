//each fieldset acts like a column
//set all columns next to each other if possible
const fieldsetStyle={display:'inline-block', width:'425px', border:'none'}
//other styles defined inline or in functions that follow this Rentap function

export default function Rentap({message, color, viewOnly, icon, ap, foundFullNames, apID, header, headerNames }:
  {message:string, color:string, viewOnly:boolean,
   icon:string, ap:{[key:string]:any}, foundFullNames:Array<string>
   apID:number, header:{[key:string]:any}, headerNames:Array<string>} ) {

  return (
    <>
      <meta charSet="utf-8" />
      <title>Rental Application</title>
      <link rel="icon" href={`data:image/x-icon;base64,${icon}`} />
      <header>
        <fieldset style={fieldsetStyle}>
          <legend></legend>
          <h3 style={{margin:'0'}}>{header.Title}</h3>
          {header.StreetAddress}
          <br/> {header.CityStateZip}
          <br/> <img src={`data:image/png;base64,${icon}`} alt="Rentap Icon" />
          <div style={{display:'inline-block', fontWeight:'bold', color:color}}>{message}</div>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:'darkgreen'}}>Actions</legend>
          <div style={{width:'100%', marginBottom:'5px', display:'flex', justifyContent:'space-between'}}>
            <a href="/discard" ><button type="button" style={{backgroundColor:'#a87a23', color:'white' }} >Trash This</button></a>
            <a href="/trash" ><button type="button" style={{backgroundColor:'#a87a23', color:'white' }} >View Trash</button></a>
            <a href="/"     ><button type="button" style={{backgroundColor:'darkblue', color:'white', fontWeight:'bold' }} >New</button></a>
          </div>
          <div style={{width:'100%', display:'flex', justifyContent:'space-between'}}>
            <a href="/editheaders" ><button type="button" style={{backgroundColor:'#a87a23', color:'white'}} >Edit "Applying for:" options</button></a>
            <a href="/edit" ><button type="button" style={{backgroundColor:'darkblue', color:'white', fontWeight:'bold' }} >Edit</button></a>
          </div>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:'darkgreen'}}>Navigation</legend>
          <form action="/search" method="post"  style={{display:'flex', justifyContent:'space-between', margin:'0', marginBottom:'5'}} >
            <div>
              <a href="/prev" ><button type="button" style={{backgroundColor:'#a87a23', color:'white' }} >&lt;</button></a>
              <div style={{backgroundColor:'gray', color:'white', textAlign:'center', display:'inline-block', width:'80px' }}>{apID}</div>
              <a href="/next" ><button type="button" style={{backgroundColor:'#a87a23', color:'white' }} >&gt;</button></a>
            </div>
            <input type="text" name="search" id="search" placeholder="search" style={{width:'65%'}} />
          </form>
          <form action="/select" method="post" style={{margin:'0'}}>
            <div style={{width:'100%', display:'flex', justifyContent:'space-between'}}>
              <select name="select" id="select" value={ap.FullName ? ap.FullName : foundFullNames[0]} style={{width:'78%'}} onChange={function(){}} >
                {foundFullNames.map( (name:any) => <option value={name} key={name}>{name}</option> )}
              </select>
              <input type="submit" defaultValue="Display" style={{backgroundColor:'darkgreen', color:'white'}} />
            </div>
          </form>
        </fieldset>
      </header>
      <body style={{backgroundColor:'lightskyblue'}} >
      <form action="/save" method="post" encType="multipart/form-data" >
        <fieldset style={fieldsetStyle}>
          <legend style={{color:'darkgreen'}}>Identity</legend>
          <Label forId="fullname"  labelText="Full Name" />     <Field type="text"  name="FullName"      placeholder="First Middle Last" width='76%' ap={ap} viewOnly={viewOnly} />
          <Label forId="ssn"  labelText="Social Security" />    <Field type="text"  name="SSN"           placeholder="555-55-5555" width='76%' ap={ap} viewOnly={viewOnly} />
          <Label forId="birthdate" labelText="Birth Date" />    <Field type="date"  name="BirthDate"     placeholder="" width='38%' ap={ap} viewOnly={viewOnly} />
                                                                <Field type="text"  name="MaritalStatus" placeholder="Marital Status" width='38%' ap={ap} viewOnly={viewOnly} />
          <Label forId="email" labelText="Email" />             <Field type="email" name="Email"         placeholder="youremail@provider.com" width='76%' ap={ap} viewOnly={viewOnly} />
          <Label forId="stateid" labelText="State ID#" />       <Field type="text"  name="StateID"       placeholder="MO 123456789 1/2/2034" width='76%' ap={ap} viewOnly={viewOnly} />
          <Label forId="phone1" labelText="Phones" />           <Field type="tel"   name="Phone1"        placeholder="Phone 1" width='38%' ap={ap} viewOnly={viewOnly} />
                                                                <Field type="tel"   name="Phone2"        placeholder="Phone 2" width='38%' ap={ap} viewOnly={viewOnly} />
          <TextArea rows={5}  name="CurrentAddress"    placeholder="Address, City, State, Zip, Dates, Rent, Landlord name and phone number" ap={ap} viewOnly={viewOnly} />
          <TextArea rows={16} name="PriorAddresses"    placeholder="Prior Addresses, Cities, States, Zips, Dates, Rents, Landlords" ap={ap} viewOnly={viewOnly} />
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:'darkgreen'}}>Living Situation</legend>
          <Label forId="headername" labelText="Applying for:" />
            <select name="headerName" id="headername" style={{width:'76%', marginLeft:'8', marginBottom:'2'}}  value={header.Name} onChange={function(){}} >
              {headerNames.map( (name) => <option value={name} key={name}>{name}</option> )}
            </select>
          <TextArea rows={5}  name="ProposedOccupants" placeholder="Proposed Occupants: self+age, other+age" ap={ap} viewOnly={viewOnly} />
          <TextArea rows={3}  name="ProposedPets"      placeholder="Proposed Pets, names, types, ages, weights" ap={ap} viewOnly={viewOnly} />
          <TextArea rows={6}  name="Income"            placeholder="Income amount and source" ap={ap} viewOnly={viewOnly} />
          <TextArea rows={14} name="Employment"        placeholder="Employment: address, job/position, dates, hours, supervisor name and phone number" ap={ap} viewOnly={viewOnly} />
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:'darkgreen'}}>Criminal &amp; Civil Record | Notes</legend>
          <TextArea rows={15} name="Evictions"         placeholder="Evictions Past 10 Years, or other notes" ap={ap} viewOnly={viewOnly} />
          <TextArea rows={15} name="Felonies"          placeholder="Felonies/Drug Convictions, or other notes" ap={ap} viewOnly={viewOnly} />
        </fieldset>
        <br />
        <Label forId="dateapplied" labelText="Date Applied"/> <Field type="date" name="dateApplied" placeholder="" width='auto' ap={ap} viewOnly={viewOnly} />
        <Label forId="dateguested" labelText="Date Guested"/> <Field type="date" name="dateGuested" placeholder="" width='auto' ap={ap} viewOnly={viewOnly} />
        <Label forId="daterented" labelText="Date Rented"  /> <Field type="date" name="dateRented"  placeholder="" width='auto' ap={ap} viewOnly={viewOnly} />
        <input type="submit" defaultValue="Save" style={{backgroundColor:'darkgreen', color:'white', marginLeft:'15px'}} />
      </form>
      </body>
    </>
  );
}

//setting up functions for inline CSS instead of passing CSS as a string to Rentap which has to be included with dangerouslySetInnerHTML

function Label({forId, labelText}: {forId:string, labelText:string}) {
  return (
    <label htmlFor={forId} style={{width:'94px', display:'inline-block', textAlign:'right', fontSize:'10px'}} > {labelText} </label>
  )
}

function Field({type, name, placeholder, width, ap, viewOnly}: { type: string, name: string, placeholder: string, width: string, ap: {[key:string]: any}, viewOnly: boolean }) {
  return (
    <input type={type} name={name} id={name.toLowerCase()} placeholder={placeholder} style={{width:width, marginBottom:2}} value={ap[name]} readOnly={viewOnly} onChange={function(){}} />
  )
}

function TextArea({rows, name, placeholder, ap, viewOnly}: { rows:number, name:string, placeholder:string, ap: {[key:string]: any}, viewOnly: boolean }) {
  return (
    <textarea rows={rows} name={name} placeholder={placeholder} style={{width:'100%', marginBottom:2}} defaultValue={ap[name]} readOnly={viewOnly} onChange={function(){}} />
  )
}
