import React, { useEffect } from "react";
import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import locales from "../../assets/data/locales.json";

export default function MapScreen() {
  // Referencia al componente MapView, para poder manipular el mapa
  const map_reference = React.useRef<MapView>(null);
  //Region inicial del mapa (Santiago, Chile)
  const region = {
    latitude: -33.4489,
    longitude: -70.6693,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  //Cambiar pantalla para mostrar todos los marcadores
  useEffect(() =>{
    //Si no referencia el mapa o no hay locales
  if (!map_reference.current || locales.length === 0) return; 
  //constante array
  //con l recorremos todo el json
  //en base a cada local crea un objeto tomando latitude y longitude
  const marcadores = locales.map (l => ({latitude: l.lat, longitude: l.lng }));
  //Llamo a mi mapa, current fit se encarga de mostrar todos los marcadores
  //Ajustados a mi dispositivo
  map_reference.current.fitToCoordinates(marcadores, {
    //Nos da margen para que el mapa no se pegue con los bordes
    edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
    //Da animacion al mapa al mover
    animated: true,
  });

  },
  /*el [] nos señala que se ejecutara una vez al iniciar*/  
  []);


 return (
  //Componentes del mapa (View es el contenedor padre)
  //flex hace que ocupe toda la pantalla
    <View style={{ flex: 1 }}>
      {/*Conexion del map ref para usar fittocoodinates, el marcador arranca en mi region*/}
      <MapView ref={map_reference} style={{ flex: 1 }} initialRegion={region}>
        {/*Creacion de marcadores en base a mi json*/}
        {/*Por cada uno rea un marker*/}
        {locales.map(loc => (
          //Marcador
          <Marker
          //La key es con la que identificaremos dentro de la logica el local
          //Importante para mostrar en el modal
            key={loc.id}
            //Cordenada del marcador
            coordinate={{ latitude: loc.lat, longitude: loc.lng }}
            //Nombre
            title={loc.name}
            //Descripcion
            description={loc.type + ' • ' + loc.address}
            />
        ))}
      </MapView>
    </View>
  );
}

