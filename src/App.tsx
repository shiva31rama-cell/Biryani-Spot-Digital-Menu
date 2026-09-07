import { useMemo, useState } from 'react';

type Item = { name: string; price?: number; half?: number; full?: number; veg?: boolean };
type Category = { name: string; items: Item[] };
const C = (name: string, items: Item[]): Category => ({ name, items });
const v = (name: string, price: number): Item => ({ name, price, veg: true });
const n = (name: string, price: number): Item => ({ name, price, veg: false });
const hf = (name: string, half: number, full: number, veg = false): Item => ({ name, half, full, veg });

const MENU: Category[] = [
C('Non Veg Soups',[n('Chicken Hot & Sour Soup',100),n('Chicken Manchow Soup',100),n('Chicken Sweet Corn Soup',100),n('Chicken Clear Soup',100),n('Chicken Coriander Clear Soup',100)]),
C('Veg Soups',[v('Veg Soup',100),v('Veg Hot Sour Soup',100),v('Veg Manchow Soup',100),v('Veg Sweet Corn Soup',100),v('Veg Coriander Clear Soup',100),v('Lemon Corn Soup',100)]),
C('Veg Starters',[v('Veg Manchuria',100),v('Veg 65',100),v('Paneer Manchuria',180),v('Paneer Chilli',180),v('Paneer 65',180),v('Mushroom Chilli',200),v('Mushroom Manchuria',200),v('Mushroom 65',200),v('Baby Corn Chilli',200),v('Baby Corn 65',200),v('Baby Corn Manchuria',200)]),
C('Non Veg Starters',[n('Egg Manchuria',150),n('Egg 65',150),n('Chilli Chicken',200),n('Chicken Manchuria',200),n('Chicken 65',200),n('Ginger Chicken',200),n('Dragon Chicken',250),n('Chicken Majesty',250),n('Chicken 555',250),n('Kaju Chicken',250),n('Chicken Lollipop (6)',180),n('Chicken Wings (15)',200),n('Lemon Chicken',250),n('Chicken Gulzar',300),n('Stick Chicken',250),n('Schezwan Chicken',200),n('Garlic Chicken',200),n('Chicken Keema Balls',300),n('Guntur Mirapakay Kodi',300)]),
C('Tandoori Starter',[hf('Tandoori Chicken',220,400),hf('Tandoori Kabab',140,280),hf('Chicken Tikka',150,300),hf('Pudina Kabab',250,500),hf('Pudina Tikka',150,300),hf('Garlic Kabab',250,500),hf('Garlic Tikka',150,300),hf('Lahori Kabab',250,500),hf('Lahori Tikka',150,300)]),
C('Veg Tandoori Starter',[v('Paneer Tikka',200),v('Mushroom Tikka',200),v('Baby Corn Tikka',200)]),
C("Biryani's",[hf('Chicken Dum Biryani',150,250),hf('Chicken Fry Biryani',150,250),hf('Chicken Rost Biryani',150,250),hf('Mutton Dum Biryani',300,400),hf('Mutton Rost Biryani',300,400),n('Rambo Biryani',300),n('Chicken Boneless Biryani',300),n('Kabab Biryani',300),hf('Prawns Biryani',300,400),hf('Mixed Biryani',300,400),n('Mughalai Biryani',350),n('Punjabi Chicken Biryani',300),n('Biryani Spot Special Biryani',350),n('Family Pack Biryani',600)]),
C('Veg Friedrice',[v('Veg Friedrice',80),v('SP. Veg Friedrice',200),v('Schezwan Friedrice',120),v('Paneer Friedrice',160),v('Kaju Friedrice',160),v('Sweet Corn Friedrice',160),v('Mushroom Friedrice',160)]),
C('Noodles',[v('Veg Noodles',80),n('Chicken Noodles',100)]),
C('Non Veg Friedrice',[hf('Chicken Friedrice',100,150),hf('Double Egg Friedrice',100,150),n('SP. Chicken Friedrice',250),hf('Chicken Schezwan Friedrice',120,160),hf('Mixed Friedrice',300,400),n('Triple Friedrice',250),hf('Mutton Friedrice',300,400)]),
C('Roti & Nons',[v('Tandoori Roti',20),v('Tandoori Butter Roti',25),v('Butter Naan',40),v('Plain Naan',30),v('Garlic Naan',50),v('Cheese Naan',60),v('Masala Kulcha',70)]),
C('Veg Curries',[v('Paneer Curry',150),v('Paneer Butter Masala',150),v('Kaju Paneer',200),v('Kaju Tamota',150),v('Kaju Masala',200),v('Palak Paneer',150),v('Mushroom Curry',200),v('Baby Corn Curry',180)]),
C('Non Veg Curries',[n('Chicken Boneless Curry',150),n('Butter Chicken',150),n('Chicken Kohlapuri',150),n('Kadai Chicken',150),n('Hyderabadi Curry',150),n('Mogalai Chicken',200),n('Chicken Patiala Curry',200),n('Chicken Tikka Masala',200),n('Mutton Curry',250),n('Prwans Curry',250),n('Chicken Keema Masala',250),n('Palak Chicken',200),n('Methi Chicken',200)])
];

const priceText=(i:Item)=>i.half!=null?`₹${i.half} / ₹${i.full}`:`₹${i.price}`;

export default function App(){
 const [query,setQuery]=useState(''); const [filter,setFilter]=useState<'all'|'veg'|'nonveg'>('all'); const [cart,setCart]=useState<Record<string,number>>({}); const [welcome,setWelcome]=useState(true);
 const visible=useMemo(()=>MENU.map(c=>({...c,items:c.items.filter(i=>(!query||i.name.toLowerCase().includes(query.toLowerCase())||c.name.toLowerCase().includes(query.toLowerCase()))&&(filter==='all'||(filter==='veg'?i.veg:!i.veg)))})).filter(c=>c.items.length),[query,filter]);
 const count=Object.values(cart).reduce((a,b)=>a+b,0); const add=(name:string)=>setCart(x=>({...x,[name]:(x[name]||0)+1}));
 if(welcome)return <div className="welcome"><div className="brand-mark">🍛</div><p className="eyebrow">DIGITAL MENU</p><h1>Biryani Spot</h1><p>Authentic biryani, tandoori starters, curries, fried rice, noodles and more.</p><button onClick={()=>setWelcome(false)}>View Menu →</button><div className="welcome-note">Menu prices shown as provided by the restaurant.</div></div>;
 return <div className="app"><header><div><span className="eyebrow">DIGITAL MENU</span><h1>Biryani Spot</h1></div><button className="cart" onClick={()=>alert(`Cart: ${count} item${count===1?'':'s'}`)}>🛒 {count}</button></header><section className="hero"><span>🍽️ BIRYANI • TANDOORI • MULTI CUISINE</span><h2>Our Menu</h2><p>Choose your favourites and explore the complete menu.</p></section><div className="controls"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search dishes..."/><div className="filters"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All</button><button className={filter==='veg'?'active':''} onClick={()=>setFilter('veg')}>Veg</button><button className={filter==='nonveg'?'active':''} onClick={()=>setFilter('nonveg')}>Non-Veg</button></div></div><main>{visible.map(c=><section className="category" key={c.name}><div className="cat-title"><h2>{c.name}</h2><span>{c.items.length} items</span></div><div className="grid">{c.items.map(i=><article className="card" key={`${c.name}-${i.name}`}><div className="food-image">{i.veg?'🥗':'🍗'}</div><div className="card-body"><div className="dish-row"><h3>{i.name}</h3><span className={i.veg?'veg-dot':'nonveg-dot'}></span></div><p className="price">{priceText(i)}</p><button onClick={()=>add(i.name)}>Add to order</button></div></article>)}</div></section>)}</main><footer><strong>Biryani Spot</strong><p>Digital menu • Prices from restaurant menu</p></footer></div>;
}
