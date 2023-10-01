import React, { useState } from "react";

//Passing icon and css as workaround because I can't seem to import icon.png or figure out css in React
export default function Rentap() {

  const [edited, setEdited] = useState(false);

  const markFormEdited = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEdited(true);
  }

  return (
    <>
      <meta charSet="utf-8" />
      <title>Rental Application</title>
      <link rel="icon" type="image/png" href="icon.png" />
      <link rel="stylesheet" type="text/css" href="styles.css" />
      <header>
        <img src="icon.png" alt="Rental Application Icon" />
        <h1>Rental Application</h1>
      </header>
      <form action="/save" method="post" encType="multipart/form-data" onChange={markFormEdited} >
        <fieldset>
          <legend>Identity</legend>
          <label htmlFor="fullname"> Full Name </label>{" "}       <input type="text" name="FullName"      id="fullname" placeholder="Full Name" />
          <label htmlFor="ssnumber"> Social Security </label>{" "} <input type="text" name="SSN"           id="ssnumber" placeholder="555-55-5555" pattern="\d{3}-\d{2}-\d{4}" />
          <label htmlFor="birthdate"> Birth Date </label>{" "}     <input type="date" name="BirthDate"     id="birthdate" placeholder="Birth Date" />
                                                                   <input type="text" name="MaritalStatus" id="maritalstatus" className="halfwidth" placeholder="Marital Status" />
          <label htmlFor="email"> Email </label>{" "}             <input type="email" name="Email"         id="email" placeholder="Email" />
          <label htmlFor="stateid"> State ID# </label>{" "}        <input type="text" name="StateID"       id="stateid" placeholder="State ID" />
          <label htmlFor="phone1"> Phones </label>{" "}             <input type="tel" name="Phone1"        id="phone1" className="halfwidth" placeholder="Phone 1" />
                                                                    <input type="tel" name="Phone2"        id="phone2" className="halfwidth" placeholder="Phone 2" />
          <textarea rows={5} name="CurrentAddress" id="currentaddress" placeholder="Address, City, State, Zip, Dates, Rent, Landlord name and phone number" defaultValue={""} />
          <textarea rows={17} name="PriorAddresses" id="prioraddresses" placeholder="Prior Addresses, Cities, States, Zips, Dates, Rents, Landlords" defaultValue={""} />
        </fieldset>
        <fieldset>
          <legend>Living Situation</legend>
          <textarea rows={5} name="ProposedOccupants" id="proposedoccupants" placeholder="Proposed Occupants: self+age, other+age" defaultValue={""} />
          <textarea rows={3} name="ProposedPets" id="proposedpets" placeholder="Proposed Pets" defaultValue={""} />
          <textarea rows={6} name="Income" id="income" placeholder="Income" defaultValue={""} />
          <textarea rows={15} name="Employment" id="employment" placeholder="Employment: address, job, dates, hours, supervisor name and phone number" defaultValue={""} />
        </fieldset>
        <fieldset>
          <legend>Criminal &amp; Civil Record | Notes</legend>
          <textarea rows={15} name="Evictions" id="evictions" placeholder="Evictions Past 10 Years, or other notes" defaultValue={""} />
          <textarea rows={15} name="Felonies" id="felonies" placeholder="Felonies/Drug Convictions, or other notes" defaultValue={""} />
        </fieldset>
        <br />
        <label htmlFor="dateapplied" className="personalinfo"> Date Applied </label>{" "} <input type="date" name="dateApplied" id="dateapplied" />
        <label htmlFor="dateguested" className="personalinfo"> Date Guested </label>{" "} <input type="date" name="dateGuested" id="dateguested" />
        <label htmlFor="daterented" className="personalinfo"> Date Rented </label>{" "} <input type="date" name="dateRented" id="daterented" />
        <input type="text" name="headerName" id="headerName" placeholder="Header Name" />
        <div>
          {edited && <input type="submit" defaultValue="Save" />}
        </div>
      </form>
    </>
  );
}
