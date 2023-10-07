//each fieldset acts like a column
//set all columns next to each other if possible
const fieldsetStyle={display:'inline-block', width:'425px', border:'none'}
//other styles defined inline or in functions that follow this Rentap function

export default function Rentap({icon, message, color, ap}: { icon: string, message: string, color: string, ap: {[key: string]: any} } ) {


  return (
    <>
      <meta charSet="utf-8" />
      <title>Rental Application</title>
      <link rel="icon" href={`data:image/x-icon;base64,${icon}`} />
      <header>
        <img src={`data:image/png;base64,${icon}`} alt="Rental Application Icon" />
        <h1 style={{display:'inline-block'}}>Rental Application</h1>
        <Space />
        <h3 style={{display:'inline-block', color:color}}>{message}</h3>
      </header>
      <body style={{backgroundColor:'paleturquoise'}} >
      <form action="/save" method="post" encType="multipart/form-data" >
        <fieldset style={fieldsetStyle}>
          <legend>Identity</legend>
          <Label forId="fullname"  labelText="Full Name" />     <Field type="text"  name="FullName"      placeholder="First Middle Last" width='76%' ap={ap} />
          <Label forId="ssn"  labelText="Social Security" />    <Field type="text"  name="SSN"           placeholder="555-55-5555" width='76%' ap={ap} />
          <Label forId="birthdate" labelText="Birth Date" />    <Field type="date"  name="BirthDate"     placeholder="" width='38%' ap={ap} />
                                                                <Field type="text"  name="MaritalStatus" placeholder="Marital Status" width='38%' ap={ap} />
          <Label forId="email" labelText="Email" />             <Field type="email" name="Email"         placeholder="youremail@provider.com" width='76%' ap={ap} />
          <Label forId="stateid" labelText="State ID#" />       <Field type="text"  name="StateID"       placeholder="MO 123456789 1/2/2034" width='76%' ap={ap} />
          <Label forId="phone1" labelText="Phones" />           <Field type="tel"   name="Phone1"        placeholder="Phone 1" width='38%' ap={ap} />
                                                                <Field type="tel"   name="Phone2"        placeholder="Phone 2" width='38%' ap={ap} />
          <TextArea rows={5}  name="CurrentAddress"    placeholder="Address, City, State, Zip, Dates, Rent, Landlord name and phone number" ap={ap} />
          <TextArea rows={17} name="PriorAddresses"    placeholder="Prior Addresses, Cities, States, Zips, Dates, Rents, Landlords" ap={ap} />
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend>Living Situation</legend>
          <TextArea rows={5}  name="ProposedOccupants" placeholder="Proposed Occupants: self+age, other+age" ap={ap} />
          <TextArea rows={3}  name="ProposedPets"      placeholder="Proposed Pets, names, types, ages, weights" ap={ap} />
          <TextArea rows={6}  name="Income"            placeholder="Income amount and source" ap={ap} />
          <TextArea rows={15} name="Employment"        placeholder="Employment: address, job/position, dates, hours, supervisor name and phone number" ap={ap} />
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend>Criminal &amp; Civil Record | Notes</legend>
          <TextArea rows={15} name="Evictions"         placeholder="Evictions Past 10 Years, or other notes" ap={ap} />
          <TextArea rows={15} name="Felonies"          placeholder="Felonies/Drug Convictions, or other notes" ap={ap} />
        </fieldset>
        <br />
        <Label forId="dateapplied" labelText="Date Applied"/> <Field type="date" name="dateApplied" placeholder="" width='auto' ap={ap} />
        <Label forId="dateguested" labelText="Date Guested"/> <Field type="date" name="dateGuested" placeholder="" width='auto' ap={ap} />
        <Label forId="daterented" labelText="Date Rented"  /> <Field type="date" name="dateRented"  placeholder="" width='auto' ap={ap} />
        <Space />
        <Field type="text" name="headerName" placeholder="Header Name" width='auto' ap={ap} />
        <Space />
        <input type="submit" defaultValue="Save" style={{backgroundColor:'lightgreen'}} />
        <Space />
        <a href="/">New</a>
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

function Field({type, name, placeholder, width, ap}: { type: string, name: string, placeholder: string, width: string, ap: {[key:string]: any} }) {
  return (
    ap[name] ?
    <input type={type} name={name} id={name.toLowerCase()} placeholder={placeholder} style={{width:width}} value={ap[name]} readOnly={true}/>
    : <input type={type} name={name} id={name.toLowerCase()} placeholder={placeholder} style={{width:width}} />
  )
}

function TextArea({rows, name, placeholder, ap}: { rows:number, name:string, placeholder:string, ap: {[key:string]: any} }) {
  return (
    ap[name] ?
    <textarea rows={rows} name={name} placeholder={placeholder} style={{width:'100%'}} defaultValue={ap[name]} readOnly={true}/>
    : <textarea rows={rows} name={name} placeholder={placeholder} style={{width:'100%'}} />
  )
}

function Space() {
  return (
    <div style={{width:'15px', display:'inline-block'}}></div>
  )
}
