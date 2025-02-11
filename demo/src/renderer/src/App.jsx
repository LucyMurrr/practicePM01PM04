import { useEffect, useState } from "react"
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";
import s from './assets/s.png'

function App() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  useEffect(() => {
    (async () => {
      const res = await window.api.getPartners()
      setPartners(res)
    })()
  }, [])
  return (
    <>
      <div className="page-heading">
        <img className="page-logo" src={s} alt="" />
        <h1>Партнеры</h1>
      </div>
      <Link to={'/create'}>
        <button>
          Создать партнера
        </button>
      </Link>
      <ul className="partners-list">
        {partners.map((partner) => {
          return <li className="partner-card" key={partner.partner_id} onClick={() => { navigate('/update', { state: { partner } }) }}>
            <div className="partner-data">
              <p className="card_heading">{partner.partner_type} | <span>{partner.partner_name}</span></p>
              <div className="partner-data-info">
                <div className="bold_head">
                  <p><span>Директор:</span> {partner.manager}</p>
                  <p><span>Телефон:</span> {partner.phone}</p>
                  <p><span>Рейтинг:</span> {partner.rating}</p>
                  <p><span>Email:</span> {partner.email}</p>
                </div>
                <hr/>
                <div className="partner-products">
                  <h3>Продукция:</h3>
                  <ul>
                    {partner.sales && Array.isArray(partner.sales) && partner.sales.length > 0 ? (
                      partner.sales.map((sale, index) => (
                        <li key={index}>
                          <p><span>Название:</span> {sale.productName || "Нет данных"}</p>
                          <p><span>Тип:</span> {sale.productType || "Нет данных"}</p>
                          <p><span>Минимальная стоимость:</span> {sale.minCost || "Нет данных"}</p>
                          <p><span>Количество:</span> {sale.productsCount || "Нет данных"}</p>
                          <hr/>
                        </li>
                      ))
                    ) : (
                      <p>Нет данных о продукции</p>
                    )}
                  </ul>
                </div> 
              </div>
            </div>
          </li>
        })}
      </ul>
    </>
  )
}

export default App
