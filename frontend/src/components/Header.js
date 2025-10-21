import React from 'react';
import { Link } from 'react-router-dom'; // Đảm bảo import Link
import { useDispatch, useSelector } from "react-redux";

export const Header = () => {

    const { user, profile, cart } = useSelector(state => state.userReducer);

    const { id, token } = user;

    const { address, orders } = profile;

    const cartCount  = () => {
        if(Array.isArray(cart)){
            return cart.length;
        }
        return 0;
    };


    const loginProfile = () => {
        if(token){
            return (
                // Sửa class -> className
                <ul className="navbar-nav"> 
                    {/* Sửa class -> className */}
                    <li className="nav-item" style={{ backgroundColor: '#97C885', width: 90, borderRadius: 50}}>
                        {/* Bỏ href="#" */}
                        <Link to="/login" className="btn-lg nav-link text-white"> 
                            {/* Sửa class -> className */}
                            <i className="fas fa-shopping-cart"></i> 
                            <span className="ml-3" style={{ fontSize: '1.1rem', fontWeight: 'bold'}}>{cartCount()}</span>
                        </Link>
                    </li>
                    {/* Sửa class -> className */}
                    <li className="nav-item"> 
                        <Link to="/login" className="btn-lg nav-link text-white">
                            {/* Sửa class -> className */}
                            <i className="fas fa-user"></i> 
                            <span className="ml-1"></span>
                        </Link>
                    </li>
                </ul>
            );
        } else {
            return (
                // Sửa class -> className
                <ul className="navbar-nav"> 
                     {/* Sửa class -> className */}
                    <li className="nav-item"> 
                        <a href="#" className="btn-lg nav-link text-warning">
                            {/* Sửa class -> className */}
                            <i className="fas fa-shopping-cart"></i> 
                        </a>
                    </li>
                     {/* Sửa class -> className */}
                    <li className="nav-item">
                        <Link to="/login" className="btn-lg nav-link text-white">
                             {/* Sửa class -> className */}
                            <i className="fas fa-user"></i>
                            <span className="ml-1">Login</span>
                        </Link>
                    </li>
                </ul>
            );
        }
    }


    return (
        // Sửa class -> className
        <nav className="navbar navbar-expand-sm navbar-light border-bottom" style={{ backgroundColor: '#61AB4F'}}> 
            {/* Sửa class -> className */}
            <div className="container-fluid"> 
                {/* Xóa thẻ <a> bên ngoài, sửa class -> className */}
                <Link className="navbar-brand text-white" to="/">Online Shopping</Link> 
                {/* Sửa class -> className */}
                <button className="navbar-toggler btn-lg" data-toggle="collapse" data-target="#navbarNav"> 
                    {/* Sửa class -> className */}
                    <i className="fa fa-bars" aria-hidden="true" style={{ backgroundColor: '#4DA052', color: '#FFF'}}></i> 
                </button>
                 {/* Sửa class -> className */}
                <div className="collapse navbar-collapse" id="navbarNav">
                     {/* Sửa class -> className */}
                    <ul className="navbar-nav m-auto"> 
                    </ul>
                    {loginProfile()}
                </div>
            </div>
        </nav>
    );
}