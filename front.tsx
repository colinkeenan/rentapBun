import { hydrateRoot } from 'react-dom/client';
import { useRef } from 'react';
import { Rentap, EditHeaders } from "./rentap.tsx";

// So far, I can't figure out how to bundle this and serve it. I was testing a submit on change for selecting header to edit, but can't make it work
function selectHeaderToEdit (editRow:number, headerNames:Array<string>) {
  const selectForm = useRef(null)
  const handleSubmit = () => {console.log("about to submit"); selectForm.current.submit()}
  return (
    <form ref={selectForm} action="/editheader" method="post" onChange={handleSubmit}>
      <select name="select" id="select" style={{width:'60%'}}  value={headerNames[editRow]} onChange={handleSubmit} >
        {headerNames.map( (name:string) => <option value={name} key={name}>{name}</option> )}
      </select>
      <input type="submit" defaultValue="Edit" style={{backgroundColor:'darkblue', color:'white'}} />
    </form>
  )
}

// This will be injected into html shown in browswer, so window will be defined along with
// variables passed from back.tsx.
// So, headers, icon, message, editOption for EditHeaders come from back.tsx
// And, message, viewOnly, icon, ap, searchField, foundFullNames, apID, header, headerNames, and inTrash
// for Rentap also come from back.tsx
const root = window.location.href.includes('header') ?
  hydrateRoot(document, <EditHeaders headers={headers} icon={icon} message={message} editOption={editOption} />) :
  hydrateRoot(document, <Rentap message={message} viewOnly={viewOnly} icon={icon} ap={ap} searchField={searchField} foundFullNames={foundFullNames} apID={apID} header={header} headerNames={headerNames} inTrash={inTrash} />);
