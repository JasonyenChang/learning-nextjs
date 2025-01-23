import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { customers } from './placeholder-data';

export async function fetchRevenue() {
  try {
    console.log('## Fetching revenue data... ##');

    await fetch("https://jsonplaceholder.typicode.com/todos/1");
    await fetch("https://jsonplaceholder.typicode.com/todos/2");
    await fetch("https://jsonplaceholder.typicode.com/todos/3");
    await fetch("https://jsonplaceholder.typicode.com/todos/4");
    await fetch("https://jsonplaceholder.typicode.com/todos/5");
    await fetch("https://jsonplaceholder.typicode.com/todos/6");
    await fetch("https://jsonplaceholder.typicode.com/todos/7");
    await fetch("https://jsonplaceholder.typicode.com/todos/8");
    await fetch("https://jsonplaceholder.typicode.com/todos/9");
    await fetch("https://jsonplaceholder.typicode.com/todos/10");

    function generateRandomNumber() {
      return Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
    }

    const data = {
      rows: [
        { month: 'Jan', revenue: generateRandomNumber() },
        { month: 'Feb', revenue: generateRandomNumber() },
        { month: 'Mar', revenue: generateRandomNumber() },
        { month: 'Apr', revenue: generateRandomNumber() },
        { month: 'May', revenue: generateRandomNumber() },
        { month: 'Jun', revenue: generateRandomNumber() },
        { month: 'Jul', revenue: generateRandomNumber() },
        { month: 'Aug', revenue: generateRandomNumber() },
        { month: 'Sep', revenue: generateRandomNumber() },
        { month: 'Oct', revenue: generateRandomNumber() },
        { month: 'Nov', revenue: generateRandomNumber() },
        { month: 'Dec', revenue: generateRandomNumber() },
      ]
    }

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    console.log('## Fetching invoice data... ##');

    await fetch("https://jsonplaceholder.typicode.com/todos/11");
    await fetch("https://jsonplaceholder.typicode.com/todos/12");
    await fetch("https://jsonplaceholder.typicode.com/todos/13");
    await fetch("https://jsonplaceholder.typicode.com/todos/14");
    await fetch("https://jsonplaceholder.typicode.com/todos/15");
    await fetch("https://jsonplaceholder.typicode.com/todos/16");
    await fetch("https://jsonplaceholder.typicode.com/todos/17");
    await fetch("https://jsonplaceholder.typicode.com/todos/18");
    await fetch("https://jsonplaceholder.typicode.com/todos/19");
    await fetch("https://jsonplaceholder.typicode.com/todos/20");

    const data = {
      rows: [
        {
          name: 'Evil Rabbit',
          email: 'evil@rabbit.com',
          image_url: '/customers/evil-rabbit.png',
          amount: 15795,
          id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
        },
        {
          name: 'Delba de Oliveira',
          email: 'delba@oliveira.com',
          image_url: '/customers/delba-de-oliveira.png',
          amount: 20569,
          id: '3958dc9e-712f-4377-85e9-fec4b6a6442a'
        },
        {
          name: 'Amy Burns',
          email: 'amy@burns.com',
          image_url: '/customers/amy-burns.png',
          amount: 30,
          id: 'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9',
        },
        {
          name: 'Michael Novotny',
          email: 'michael@novotny.com',
          image_url: '/customers/michael-novotny.png',
          amount: 44800,
          id: '76d65c26-f784-44a2-ac19-586678f7c2f2',
        },
        {
          name: 'Balazs Orban',
          email: 'balazs@orban.com',
          image_url: '/customers/balazs-orban.png',
          amount: 5000,
          id: '13D07535-C59E-4157-A011-F8D2EF4E0CBB',
        },
      ]
    }

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getSortedPostsData() {
  const url = "https://jsonplaceholder.typicode.com/todos/1";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const result = await response.json();
    return { title: result.title };
  } catch (error) {
    console.error(`Failed to fetch data`);
    // Return a fallback value to prevent undefined
    return [];
  }
}