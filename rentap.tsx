import React, { useState } from "react";

//Passing icon and css as workaround because I can't seem to import icon.png or figure out css in React
export default function Rentap({icon, css}: {icon: string, css: string}) {

  const [edited, setEdited] = useState(false);

  const markFormEdited = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEdited(true);
  }

  return (
    <>
      <meta charSet="utf-8" />
      <title>Rental Application</title>
      {/* for some reason, the below favicon only shows up when served from back.tsx (icon ? is true), not front.tsx */}
      { icon ? <link rel="icon" href={`data:image/x-icon;base64,${icon}`} /> : <link rel="icon" type="image/png" href="icon.png" /> }
      { css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : <link rel="stylesheet" type="text/css" href="styles.css" /> }
      <header>
        { icon ? <link rel="icon" href={`data:image/x-icon;base64,${icon}`} /> : <img src="icon.png" alt="Rental Application Icon" /> }
        <h1>Rental Application</h1>
      </header>
      <form action="/save" method="post" encType="multipart/form-data" onChange={markFormEdited} >
        <fieldset>
          <legend>Identity</legend>
          <label htmlFor="fullname"> Full Name </label>       <input type="text" name="FullName"      id="fullname" placeholder="First Middle Last" />
          <label htmlFor="ssnumber"> Social Security </label> <input type="text" name="SSN"           id="ssnumber" placeholder="555-55-5555" />
          <label htmlFor="birthdate"> Birth Date </label>     <input type="date" name="BirthDate"     id="birthdate" />
                                                              <input type="text" name="MaritalStatus" id="maritalstatus" className="halfwidth" placeholder="Marital Status" />
          <label htmlFor="email"> Email </label>             <input type="email" name="Email"         id="email" placeholder="youremail@provider.com" />
          <label htmlFor="stateid"> State ID# </label>        <input type="text" name="StateID"       id="stateid" placeholder="MO 123456789 1/2/2034" />
          <label htmlFor="phone1"> Phones </label>             <input type="tel" name="Phone1"        id="phone1" className="halfwidth" placeholder="Phone 1" />
                                                               <input type="tel" name="Phone2"        id="phone2" className="halfwidth right" placeholder="Phone 2" />
          <textarea rows={5}  name="CurrentAddress" id="currentaddress" placeholder="Address, City, State, Zip, Dates, Rent, Landlord name and phone number" defaultValue={""} />
          <textarea rows={17} name="PriorAddresses" id="prioraddresses" placeholder="Prior Addresses, Cities, States, Zips, Dates, Rents, Landlords" defaultValue={""} />
        </fieldset>
        <fieldset>
          <legend>Living Situation</legend>
          <textarea rows={5}  name="ProposedOccupants" id="proposedoccupants" placeholder="Proposed Occupants: self+age, other+age" defaultValue={""} />
          <textarea rows={3}  name="ProposedPets" id="proposedpets" placeholder="Proposed Pets, names, types, ages, weights" defaultValue={""} />
          <textarea rows={6}  name="Income" id="income" placeholder="Income amount and source" defaultValue={""} />
          <textarea rows={15} name="Employment" id="employment" placeholder="Employment: address, job/position, dates, hours, supervisor name and phone number" defaultValue={""} />
        </fieldset>
        <fieldset>
          <legend>Criminal &amp; Civil Record | Notes</legend>
          <textarea rows={15} name="Evictions" id="evictions" placeholder="Evictions Past 10 Years, or other notes" defaultValue={""} />
          <textarea rows={15} name="Felonies" id="felonies" placeholder="Felonies/Drug Convictions, or other notes" defaultValue={""} />
        </fieldset>
        <br />
        <label htmlFor="dateapplied"> Date Applied </label> <input type="date" name="dateApplied" id="dateapplied" />
        <label htmlFor="dateguested"> Date Guested </label> <input type="date" name="dateGuested" id="dateguested" />
        <label htmlFor="daterented"> Date Rented   </label> <input type="date" name="dateRented"  id="daterented" />
        <label></label>
        <input type="text" name="headerName" id="headername" placeholder="Header Name" />
        <label></label>
        {edited && <input type="submit" defaultValue="Save" />}
      </form>
    </>
  );
}
