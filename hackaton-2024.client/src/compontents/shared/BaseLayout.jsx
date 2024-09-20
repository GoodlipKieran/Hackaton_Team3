import Header from "./Header";

function BaseLayout({ children }) {
  return (
    <>
      <div className="overflow-auto [scrollbar-width:thin] shadow-xl flex flex-col flex-[8%]">
        <Header />
      </div>
      <div className="overflow-auto [scrollbar-width:thin] bg-gray flex flex-col items-center align-middle flex-[92%] relative">
        {children}
      </div>
    </>
  );
}

export default BaseLayout;
