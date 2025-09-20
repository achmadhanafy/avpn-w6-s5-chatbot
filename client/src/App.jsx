import Providers from "./lib/store/provider";
import MainScreen from "./screens/MainScreen";


function App() {
  return (
    <div>
      <Providers>
        <MainScreen />
      </Providers>
    </div>
  );
}

export default App;
