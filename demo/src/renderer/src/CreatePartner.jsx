import { useEffect } from "react"
import { Link } from "react-router";

export default function CreatePartner() {
  useEffect(() => {
    document.title = 'Создать партнера';
  }, []);

  async function submitHandler(e) {
    e.preventDefault()
    const partner = {
      partnerTypeId: parseInt(e.target.type.value),
      manager: e.target.CEO.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      address: e.target.address.value,
      inn: e.target.inn.value, 
      rating: parseFloat(e.target.rating.value),
      partnerName: e.target.name.value,
    };

    await window.api.createPartner(partner);

    document.querySelector('form').reset();
  }

  return <div className="form">
    <Link to={'/'}><button>{"<-- Назад"}</button></Link>
    
    <h1>Создать партнера</h1>
    <form onSubmit={(e) => submitHandler(e)}>
      <label htmlFor="name">Наименование:</label>
      <input id="name" type="text" required />

      <label htmlFor="type">Тип партнера:</label>
      <select id="type" required>
          <option value="1">ЗАО</option>
          <option value="2">ООО</option>
          <option value="3">ПАО</option>
          <option value="4">ОАО</option>
        </select>

      <label htmlFor="rating">Рейтинг:</label>
      <input id="rating" type="number" step="1" min='0' max='100' required />

      <label htmlFor="address">Адрес:</label>
      <input id="address" type="text" required />

      <label htmlFor="CEO">ФИО директора:</label>
      <input id="CEO" type="text" required />

      <label htmlFor="phone">Телефон:</label>
      <input id="phone" type="tel" required />

      <label htmlFor="email">Email компании:</label>
      <input id="email" type="email" required />

      <label htmlFor="inn">ИНН:</label>
      <input id="inn" type="text" required />

      <button type="submit">Создать партнера</button>
    </form>
  </div>
}