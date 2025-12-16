import React from "react";

const InputWithIcon = ({ icon: Icon, type, value, onChange, placeholder }) => {
  return (
    <div className="relative w-full">
      <Icon
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
        size={20}
      />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      />
    </div>
  );
};

export default InputWithIcon;
