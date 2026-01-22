import { BrowserRouter, Routes, Route } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import Error404 from "./components/Error404/Error404";
import Header from './components/Header/Header';

import CategoryList from './components/Category/CategoryList/CategoryList';
import Product from "./components/Product/Product";
import { ShoppingCartProvider } from './context/ShoppingCartContext';
import CartList from "./components/CartList/CartList";
import { useEffect } from "react";
import facebookService from "./services/facebookService";

function App() {
  useEffect(() => {
    facebookService.init();
  },[]);
  return (<div>

    <BrowserRouter>
      <ShoppingCartProvider>
      <Header/>
        <Routes>
        <Route path="/" element={<CategoryList/>}/>
        <Route path="/categories/:categoryId" element={<CategoryList/>}/>
        <Route path="/product/:id" element={<Product/>}/>
        <Route path="/shopping-cart" element={<CartList/>}/>
        <Route path="*" element={<Error404/>}/>
      </Routes>
      </ShoppingCartProvider>
    </BrowserRouter>
    </div>
  );
}

export default App;
