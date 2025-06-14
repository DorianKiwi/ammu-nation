import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import AppHeader from '@/components/AppHeader';
import HeroSection from '@/components/HeroSection';
import WeaponCategories from '@/components/WeaponCategories';
import ReservationModal from '@/components/ReservationModal';
import AppFooter from '@/components/AppFooter';
import CartButton from '@/components/CartButton';
import PpaInfo from '@/components/PpaInfo';
import { supabase } from './src/lib/supabaseClient' from '@/lib/supabaseClient';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('ammu-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (currentCart) => {
    setCart(currentCart);
    localStorage.setItem('ammu-cart', JSON.stringify(currentCart));
  };

  const handleAddToCart = (weapon) => {
    let updatedCart;
    const existingItem = cart.find(item => item.name === weapon.name);
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.name === weapon.name ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...weapon, quantity: 1 }];
    }
    saveCart(updatedCart);
    toast({
      title: "Produit ajouté au panier ✅",
      description: (
        <div className="w-full text-left">
          <p>Nom : {weapon.name}</p>
          <p>Prix : {weapon.price.toLocaleString('fr-FR')} $</p>
          <p>Quantité : {updatedCart.find(item => item.name === weapon.name)?.quantity || 1} pièce(s)</p>
        </div>
      ),
    });
  };

  const handleUpdateQuantity = (weaponName, newQuantity) => {
    let updatedCart;
    const qty = parseInt(newQuantity, 10);

    if (isNaN(qty) || qty < 1) {
      updatedCart = cart.filter(item => item.name !== weaponName);
    } else {
      updatedCart = cart.map(item =>
        item.name === weaponName ? { ...item, quantity: qty } : item
      );
    }
    saveCart(updatedCart);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const handleReservationSubmit = async (formData) => {
    if (!formData.name || !formData.date || !formData.email || !cart || cart.length === 0) {
      toast({
        title: "Erreur de formulaire",
        description: "Veuillez remplir tous les champs obligatoires et ajouter au moins un article.",
        variant: "destructive"
      });
      return;
    }

    const orderPayload = {
      id: Date.now(), 
      name: formData.name,
      email: formData.email,
      ppa: formData.ppa || '',
      orders: cart.map(i => `${i.quantity}× ${i.name}`),
      cost: cart.reduce((s,i)=>s + i.price * i.quantity, 0),
      source: 'PUBLIC',
      date: new Date(formData.date).toISOString(),
      created_at: new Date().toISOString(),
      // Assurez-vous que les champs 'items' et 'total' sont bien gérés si votre table les requiert comme NOT NULL
      // Pour l'instant, je vais les omettre car ils n'étaient pas dans le payload original vers /api/orders
      // Si votre table `orders` a été mise à jour avec `items jsonb NOT NULL` et `total numeric NOT NULL`
      // vous devrez les fournir ici. Par exemple:
      // items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
      // total: cart.reduce((s,i)=>s + i.price * i.quantity, 0),
    };

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select();

      if (error) {
        console.error('Erreur Supabase lors de l\'insertion:', error);
        throw error;
      }
      
      toast({
        title: "✅ Commande envoyée !",
        description: "Votre réservation a été soumise avec succès et enregistrée directement dans Supabase.",
      });
      handleClearCart();
      setSelectedCategory(null); 
    } catch (error) {
      console.error("Erreur lors de l'envoi de la commande à Supabase:", error);
      toast({
        title: "🚧 Erreur d'envoi",
        description: `La commande n'a pas pu être envoyée: ${error.message}. Veuillez réessayer.`,
        variant: "destructive",
      });
    }
  };

  const handleOpenCart = () => {
    const cartCategory = {
      id: 'cart',
      name: 'Votre Commande Ammu-Nation',
      description: 'Finalisez votre réservation ici.',
      weapons: [],
    };
    setSelectedCategory(cartCategory);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
       <nav className="p-4 bg-gray-900/50 backdrop-blur-sm text-white flex gap-6 justify-center sticky top-2 z-40 w-fit mx-auto rounded-full border border-red-500/20 my-4">
        <Link to="/" className="hover:text-red-400 transition-colors">Accueil</Link>
        <Link to="/admin" className="hover:text-red-400 transition-colors">Admin</Link>
        <Link to="/lscsd" className="hover:text-red-400 transition-colors">LSCSD</Link>
      </nav>
      <div className="h-2 bg-red-600 w-full fixed top-0 z-50"></div>
      <div className="fixed inset-0 star-pattern opacity-20"></div>
      
      <AppHeader />
      <main className="pt-2">
        <HeroSection />
        <WeaponCategories onSelectCategory={setSelectedCategory} />
        <PpaInfo />
      </main>
      
      <ReservationModal
        selectedCategory={selectedCategory}
        onClose={handleCloseModal}
        onReservation={handleReservationSubmit}
        cart={cart}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
      />
      
      <CartButton cart={cart} onOpenCart={handleOpenCart} />
      <AppFooter />
    </div>
  );
}

export default App;