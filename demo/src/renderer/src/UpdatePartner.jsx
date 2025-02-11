import { useEffect, useState } from "react"
import { useLocation } from 'react-router-dom';
import { Link } from "react-router";

export default function UpdatePartner() {
  useEffect(() => { document.title = 'Обновить партнера' }, [])
  const location = useLocation();
  const [partner, setPartner] = useState(location.state.partner);

  async function submitHandler(e) {
    e.preventDefault()
    const updPartner = {
      id: partner.id,
      partnerTypeId: parseInt(e.target.type.value),
      partnerName: e.target.name.value,
      manager: e.target.CEO.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      address: e.target.address.value,
      inn: e.target.inn.value,
      rating: parseFloat(e.target.rating.value),
    }
    await window.api.updatePartner(updPartner);
    setPartner(updPartner)
    document.querySelector('form').reset()
  }

  return <div className="form">
    <Link to={'/'}><button>{"<-- Назад"}</button></Link>
    <h1>Обновить партнера</h1>
    <form onSubmit={(e) => submitHandler(e)}>
      <label htmlFor="name">Наименование:</label>
      <input id="name" type="text" required defaultValue={partner.partnerName} />
      <label htmlFor="type">Тип партнера:</label>
      <select name="" id="type" required defaultValue={partner.partnerTypeId} >
          <option value="1">ЗАО</option>
          <option value="2">ООО</option>
          <option value="3">ПАО</option>
          <option value="4">ОАО</option>
      </select>
      <label htmlFor="rating">Рейтинг:</label>
      <input id="rating" type="number" step="1" min='0' max='100' required defaultValue={partner.rating}/>
      <label htmlFor="address">Адрес:</label>
      <input id="address" type="text" required defaultValue={partner.address} />
      <label htmlFor="CEO">ФИО директора:</label>
      <input id="CEO" type="text" required defaultValue={partner.manager} />
      <label htmlFor="phone">Телефон:</label>
      <input id="phone" type="tel" required defaultValue={partner.phone} />
      <label htmlFor="email">Email компании:</label>
      <input id="email" type="email" required defaultValue={partner.email}/>
      <label htmlFor="inn">ИНН:</label>
      <input id="inn" type="text" required defaultValue={partner.inn}/>
      <button type="submit">Обновить партнера</button>
    </form>
  </div>
}