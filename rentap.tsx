//setting up functions for inline CSS instead of passing CSS as a string to Rentap which has to be included with dangerouslySetInnerHTML

function IdLabel({forId, labelText}: {forId:string, labelText:string}) {
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

const fieldsetStyle={display:'inline-block', width:'425px', border:'none'}

export default function Rentap({icon}: {icon: string}) {

  return (
    <>
      <meta charSet="utf-8" />
      <title>Rental Application</title>
      <link rel="icon" href={`data:image/x-icon;base64,${icon}`} />
      <header style={{backgroundColor:'lightcyan'}}>
        <img src={`data:image/png;base64,${icon}`} alt="Rental Application Icon" />
        <h1 style={{display:'inline-block'}}>Rental Application</h1>
      </header>
      <form action="/save" method="post" encType="multipart/form-data" style={{backgroundColor:'lightblue'}}>
        <fieldset style={fieldsetStyle}>
          <legend>Identity</legend>
          <IdLabel forId="fullname"  labelText="Full Name" />       <IdField type="text"  name="FullName"      placeholder="First Middle Last" />
          <IdLabel forId="ssnumber"  labelText="Social Security" /> <IdField type="text"  name="SSN"           placeholder="555-55-5555" />
          <IdLabel forId="birthdate" labelText="Birth Date" />    <HalfField type="date"  name="BirthDate"     placeholder=""/>
                                                                  <HalfField type="text"  name="MaritalStatus" placeholder="Marital Status" />
          <IdLabel forId="email" labelText="Email" />               <IdField type="email" name="Email"         placeholder="youremail@provider.com" />
          <IdLabel forId="stateid" labelText="State ID#" />         <IdField type="text"  name="StateID"       placeholder="MO 123456789 1/2/2034" />
          <IdLabel forId="phone1" labelText="Phones" />           <HalfField type="tel"   name="Phone1"        placeholder="Phone 1" />
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
        <label htmlFor="dateapplied"> Date Applied </label> <input type="date" name="dateApplied" id="dateapplied" />
        <label htmlFor="dateguested"> Date Guested </label> <input type="date" name="dateGuested" id="dateguested" />
        <label htmlFor="daterented"> Date Rented   </label> <input type="date" name="dateRented"  id="daterented" />
        <label></label>
        <input type="text" name="headerName" id="headername" placeholder="Header Name" />
        <label></label>
        <input type="submit" defaultValue="Save" style={{backgroundColor:'lightgreen'}} />
      </form>
    </>
  );
}
