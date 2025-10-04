import React, { useState } from 'react';
import { ShoppingCart, Search, ArrowLeft, Plus, Minus, Clock, MapPin, Utensils } from 'lucide-react';

// Props type matching your actual data structure
type MenuAppProps = {
  menuData: {
    branding: { title: string };
    categories: Array<{
      name: string;
      itemIds: string[];
      _id: string;
    }>;
    items: Array<{
      itemId: string;
      name: string;
      description: string;
      price: number;
      currency: string;
      image: string | null;
      isActive: boolean;
      isVegetarian: boolean;
      preparationTime: string | null;
    }>;
    serviceCharge: number;
    taxes: Array<{ name: string; percent: number }>;
  };
  tableId?: string;
  onAddToCart?: (item: any) => void;
};

export default function RestaurantMenuApp({ menuData, tableId = "5", onAddToCart }: MenuAppProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);

  const addToCart = (item: any) => {
    const newCart = {
      ...cart,
      [item.itemId]: {
        ...item,
        quantity: (cart[item.itemId]?.quantity || 0) + 1
      }
    };
    setCart(newCart);
    if (onAddToCart) {
      onAddToCart({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: 1
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId].quantity > 1) {
        newCart[itemId].quantity -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  // Filter items based on search and active category
  const filteredItems = menuData.items.filter(item => {
    if (!item.isActive) return false;
    
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!activeCategory) return matchesSearch;
    
    const category = menuData.categories.find(cat => cat.name === activeCategory);
    const matchesCategory = category?.itemIds.includes(item.itemId);
    
    return matchesSearch && matchesCategory;
  });

  const gstAmount = menuData.taxes.reduce((sum, tax) => sum + (cartTotal * tax.percent / 100), 0);
  const finalTotal = cartTotal + gstAmount + menuData.serviceCharge;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 py-3 flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-lg lg:text-2xl">{menuData.branding?.title || "Menu"}</h1>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
                <MapPin size={12} className="lg:w-4 lg:h-4" />
                <span>Table {tableId}</span>
                <span className="text-gray-300">•</span>
                <Clock size={12} className="lg:w-4 lg:h-4" />
                <span>30-40 mins</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-3">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 lg:py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                activeCategory === null
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {menuData.categories.map(category => (
              <button
                key={category._id}
                onClick={() => setActiveCategory(category.name)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                  activeCategory === category.name
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items - Desktop Grid / Mobile List */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Utensils size={48} className="mx-auto mb-3 opacity-30" />
            <p>No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
            {filteredItems.map(item => {
              const itemInCart = cart[item.itemId];
              return (
                <div key={item.itemId} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-3 lg:p-4 flex gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <div className={`w-4 h-4 border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          item.isVegetarian ? 'border-green-600' : 'border-red-600'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            item.isVegetarian ? 'bg-green-600' : 'bg-red-600'
                          }`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 flex-1 leading-tight text-sm lg:text-base">{item.name}</h3>
                      </div>
                      {item.description && (
                        <p className="text-xs lg:text-sm text-gray-500 mb-1.5 lg:mb-2 line-clamp-2 ml-6">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 mb-2 lg:mb-3 ml-6">
                        <span className="font-bold text-gray-900 text-sm lg:text-base">₹{item.price}</span>
                        {item.preparationTime && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={11} />
                              {item.preparationTime} mins
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Image and Add Button Column */}
                    <div className="flex flex-col items-center gap-1.5 lg:gap-2">
                      <div className="w-24 h-20 lg:w-28 lg:h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-4xl lg:text-5xl opacity-30">🍽️</div>
                        )}
                      </div>
                      
                      {!itemInCart ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="w-24 lg:w-28 px-3 py-1.5 lg:py-2 bg-white border-2 border-emerald-500 text-emerald-500 rounded-lg font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1 text-sm"
                        >
                          <Plus size={16} strokeWidth={2.5} />
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 lg:gap-2 bg-emerald-500 rounded-lg px-2 lg:px-3 py-1.5 lg:py-2 w-24 lg:w-28">
                          <button
                            onClick={() => removeFromCart(item.itemId)}
                            className="text-white hover:bg-emerald-600 rounded p-0.5 lg:p-1 transition-colors"
                          >
                            <Minus size={16} strokeWidth={2.5} />
                          </button>
                          <span className="flex-1 text-center font-bold text-white text-base lg:text-lg">
                            {itemInCart.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="text-white hover:bg-emerald-600 rounded p-0.5 lg:p-1 transition-colors"
                          >
                            <Plus size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button
          onClick={() => setShowCart(!showCart)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-5 lg:px-8 py-3 lg:py-4 rounded-xl shadow-lg flex items-center gap-3 hover:bg-emerald-600 transition-all z-50 w-[90%] max-w-md lg:max-w-lg"
        >
          <div className="flex items-center gap-2 flex-1">
            <div className="relative">
              <ShoppingCart size={20} className="lg:w-6 lg:h-6" strokeWidth={2} />
              <span className="absolute -top-2 -right-2 bg-white text-emerald-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <span className="font-semibold text-base lg:text-lg">View Cart</span>
          </div>
          <div className="h-6 w-px bg-emerald-400" />
          <span className="font-bold text-base lg:text-xl">₹{cartTotal}</span>
        </button>
      )}

      {/* Cart Drawer Overlay */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto max-w-2xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10">
              <h2 className="text-xl lg:text-2xl font-bold">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ✕
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              {cartItems.map((item: any) => (
                <div key={item.itemId} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className={`w-4 h-4 border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                    item.isVegetarian ? 'border-green-600' : 'border-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      item.isVegetarian ? 'bg-green-600' : 'bg-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold lg:text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                    <button
                      onClick={() => removeFromCart(item.itemId)}
                      className="text-emerald-500 hover:bg-gray-200 rounded p-1 transition-colors"
                    >
                      <Minus size={16} strokeWidth={2.5} />
                    </button>
                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="text-emerald-500 hover:bg-gray-200 rounded p-1 transition-colors"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                  <span className="font-bold lg:text-lg">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t space-y-2 bg-gray-50">
              <div className="flex justify-between text-sm lg:text-base">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              {menuData.taxes.map((tax, idx) => (
                <div key={idx} className="flex justify-between text-sm lg:text-base">
                  <span className="text-gray-600">{tax.name} ({tax.percent}%)</span>
                  <span>₹{(cartTotal * tax.percent / 100).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm lg:text-base">
                <span className="text-gray-600">Service Charge</span>
                <span>₹{menuData.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg lg:text-xl pt-2 border-t">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4">
              <button className="w-full bg-emerald-500 text-white py-3.5 lg:py-4 rounded-xl font-bold text-base lg:text-lg hover:bg-emerald-600 transition-colors shadow-md">
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}