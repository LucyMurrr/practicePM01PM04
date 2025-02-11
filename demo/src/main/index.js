import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import pg from 'pg'

async function getPartners() {
  const { Client } = pg;
  const user = 'postgres';
  const password = '1234';
  const host = 'localhost';
  const port = '5433';
  const database = 'master_floor';

  const client = new Client({
    user, password, host, port, database
  })
  await client.connect()

  try {
    const partnersQuery = `
    SELECT 
      pi.partner_id,
      pt.partner_type,
      pn.partner_name,
      pi.address AS legal_address,
      pi.inn,
      pi.manager,
      pi.phone,
      pi.email,
      pi.rating
    FROM 
      partners_import pi
    JOIN 
      partners_names pn ON pi.partner_id = pn.partner_id
    JOIN 
      partners_types pt ON pi.partner_type_id = pt.partner_type_id
    ORDER BY 
      pi.partner_id;
    `;

    const salesQuery = `
      SELECT 
        ppi.partner_id,
        ppi.date_of_sale,
        ppi.products_count,
        prn.product_name,
        prt.product_type,
        prt.coef_type,
        pr.min_cost
      FROM 
          partner_products_import ppi
      JOIN 
          products_import pr ON ppi.product_id = pr.products_id
      JOIN 
          products_names prn ON pr.products_id = prn.products_id
      JOIN 
          products_types prt ON pr.product_type_id = prt.product_type_id
      ORDER BY 
          ppi.partner_id, ppi.date_of_sale;
      `;  
    const [partnersRes, salesRes] = await Promise.all([
      client.query(partnersQuery),
      client.query(salesQuery),
    ]);
    const partners = partnersRes.rows.map((partner) => {
      const sales = salesRes.rows
        .filter((sale) => sale.partner_id === partner.partner_id)
        .map((sale) => ({
          dateOfSale: sale.date_of_sale,
          productsCount: sale.products_count,
          productName: sale.product_name,
          productType: sale.product_type,
          coefType: sale.coef_type,
          minCost: sale.min_cost,
        }));
      return {
        ...partner,
        sales,
      }
    });
    console.log(partners);
    return partners;
  } catch (e) {
    console.log(e);
  }
};

async function createPartner(event, partner) {
  const { Client } = pg;
  const user = 'postgres';
  const password = '1234';
  const host = 'localhost';
  const port = '5433';
  const database = 'master_floor';
  
  const client = new Client({
    user, password, host, port, database
  })
  await client.connect()
  const {
    partnerTypeId,
    manager,
    email,
    phone,
    address,
    inn,
    rating,
    partnerName,
  } = partner;
  
  try {
    await client.query(
      `WITH new_partner AS (
        INSERT INTO partners_import (partner_type_id, manager, email, phone, address, inn, rating)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING partner_id
      )
      INSERT INTO partners_names (partner_id, partner_name)
      SELECT partner_id, $8 FROM new_partner;`,
      [partnerTypeId, manager, email, phone, address, inn, rating, partnerName]
    );

    dialog.showMessageBox({ message: 'Успех! Партнер создан' });
  } catch (e) {
    console.error('Ошибка при добавлении партнера:', e);

    if (e.code === '23505' && e.constraint === 'partners_names_partner_name_key') {
      dialog.showErrorBox('Ошибка', 'Партнер с таким именем уже существует');
    } else {
      dialog.showErrorBox('Ошибка', 'Произошла ошибка при добавлении партнера');
    }
  }
};

async function updatePartner(event, partner) {
  const { Client } = pg;
  const user = 'postgres';
  const password = '1234';
  const host = 'localhost';
  const port = '5433';
  const database = 'master_floor';

  const client = new Client({
    user, password, host, port, database
  })
  await client.connect()
  const {
    partnerId,
    partnerTypeId,
    manager,
    email,
    phone,
    address,
    inn,
    rating,
    partnerName,
  } = partner;

  try {
    await client.query(
      `UPDATE partners_import
        SET
            partner_type_id = $1,
            manager = $2,
            email = $3,
            phone = $4,
            address = $5,
            inn = $6,
            rating = $7
        WHERE partner_id = $8;

        UPDATE partners_names
        SET partner_name = $9
        WHERE partner_id = $8;`,
      [partnerTypeId, manager, email, phone, address, inn, rating, partnerId, partnerName]
    );

    dialog.showMessageBox({ message: 'Успех! Данные партнера обновлены' });
    return;
  } catch (e) {
    console.error('Ошибка при обновлении данных партнера:', e);

    if (e.code === '23505' && e.constraint === 'partners_names_partner_name_key') {
      dialog.showErrorBox('Ошибка', 'Партнер с таким именем уже существует');
      return ('error');
    } else {
      dialog.showErrorBox('Ошибка', 'Произошла ошибка при обновлении данных партнера');
      return ('error');
    }
  }
};



function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: join(__dirname, '../../resources/icon.ico'),
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  ipcMain.handle('getPartners', getPartners)
  ipcMain.handle('createPartner', createPartner)
  ipcMain.handle('updatePartner', updatePartner)
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
