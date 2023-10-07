const fieldsetStyle={display:'inline-block', width:'425px', border:'none'}
//other styles defined inline or in functions that follow this Rentap function
export default function Rentap({icon}: {icon: string}) {

  return (
    <>
      <meta charSet="utf-8" />
      <title>Rental Application</title>
      <link rel="icon" href={`data:image/x-icon;base64,${icon}`} />
      <header>
        <img src={`data:image/png;base64,${icon}`} alt="Rental Application Icon" />
        <h1 style={{display:'inline-block'}}>Rental Application</h1>
      </header>
      <body style={{backgroundColor:'paleturquoise'}} >
      <form action="/save" method="post" encType="multipart/form-data" >
        <fieldset style={fieldsetStyle}>
          <legend>Identity</legend>
          <Label forId="fullname"  labelText="Full Name" />       <IdField type="text"  name="FullName"      placeholder="First Middle Last" />
          <Label forId="ssn"  labelText="Social Security" />      <IdField type="text"  name="SSN"           placeholder="555-55-5555" />
          <Label forId="birthdate" labelText="Birth Date" />    <HalfField type="date"  name="BirthDate"     placeholder=""/>
                                                                <HalfField type="text"  name="MaritalStatus" placeholder="Marital Status" />
          <Label forId="email" labelText="Email" />               <IdField type="email" name="Email"         placeholder="youremail@provider.com" />
          <Label forId="stateid" labelText="State ID#" />         <IdField type="text"  name="StateID"       placeholder="MO 123456789 1/2/2034" />
          <Label forId="phone1" labelText="Phones" />           <HalfField type="tel"   name="Phone1"        placeholder="Phone 1" />
                                                                <HalfField type="tel"   name="Phone2"        placeholder="Phone 2" />
          <TextArea rows={5}  name="CurrentAddress"    placeholder="Address, City, State, Zip, Dates, Rent, Landlord name and phone number" />
          <TextArea rows={17} name="PriorAddresses"    placeholder="Prior Addresses, Cities, States, Zips, Dates, Rents, Landlords" />
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend>Living Situation</legend>
          <TextArea rows={5}  name="ProposedOccupants" placeholder="Proposed Occupants: self+age, other+age" />
          <TextArea rows={3}  name="ProposedPets"      placeholder="Proposed Pets, names, types, ages, weights" />
          <TextArea rows={6}  name="Income"            placeholder="Income amount and source" />
          <TextArea rows={15} name="Employment"        placeholder="Employment: address, job/position, dates, hours, supervisor name and phone number" />
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend>Criminal &amp; Civil Record | Notes</legend>
          <TextArea rows={15} name="Evictions"         placeholder="Evictions Past 10 Years, or other notes" />
          <TextArea rows={15} name="Felonies"          placeholder="Felonies/Drug Convictions, or other notes" />
        </fieldset>
        <br />
        <Label forId="dateapplied" labelText="Date Applied"/> <input type="date" name="dateApplied" id="dateapplied" />
        <Label forId="dateguested" labelText="Date Guested"/> <input type="date" name="dateGuested" id="dateguested" />
        <Label forId="daterented" labelText="Date Rented"  /> <input type="date" name="dateRented"  id="daterented" />
        <Space />
        <input type="text" name="headerName" id="headername" placeholder="Header Name" />
        <Space />
        <input type="submit" defaultValue="Save" style={{backgroundColor:'lightgreen'}} />
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

function IdField({type, name, placeholder}: {type: string, name: string, placeholder: string}) {
  return (
    <input type={type} name={name} id={name.toLowerCase()} placeholder={placeholder} style={{width:'76%'}} />
  )
}

function HalfField({type, name, placeholder}: {type: string, name: string, placeholder: string}) {
  return (
    <input type={type} name={name} id={name.toLowerCase()} placeholder={placeholder} style={{width:'38%'}} />
  )
}

function TextArea({rows, name, placeholder}: {rows:number, name:string, placeholder:string }) {
  return (
    <textarea rows={rows} name={name} placeholder={placeholder} defaultValue="" style={{width:'100%'}} />
  )
}

function Space() {
  return (
    <div style={{width:'15px', display:'inline-block'}}></div>
  )
}
