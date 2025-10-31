import React, { useCallback, useEffect, useMemo } from "react";
import { Dimensions, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import locales from "../../assets/data/locales.json";

type modal={
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  type: string;
  price: number;
  rating: number;
  images?: string[];
}

export default function MapScreen() {
  // Referencia al componente MapView, para poder manipular el mapa
  const map_reference = React.useRef<MapView>(null);

  //Modal
  const [visible, setVisible] = React.useState(false);
  const [selected, setSelected] = React.useState<modal | null>(null);

  ///////////////////////////////////////////////////////////////////
  // --- buscador ---
  const [query, setQuery] = React.useState("");
  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const data = locales as modal[];
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return data;
    return data.filter(l => normalize(l.name).includes(q) || normalize(l.type).includes(q));
  }, [data, query]);
  // -----------------
  ///////////////////////////////////////////////////////////////////


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
  const marcadores = (locales as modal[]).map (l => ({latitude: l.lat, longitude: l.lng }));
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

  //Buscador
  // Ajuste del mapa cuando se filtra (no reemplaza lo anterior)
  useEffect(() => {
    if (!map_reference.current || filtered.length === 0) return;
    const coords = filtered.map(l => ({ latitude: l.lat, longitude: l.lng }));
    map_reference.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 60, bottom: 60, left: 60 },
      animated: true,
    });
  }, [filtered]);
  /////////////////////////////////////////////
  
  const abririd = useCallback((id:string) =>{
    const loc = (locales as modal[]).find(x => x.id === id) || null;
    if (loc) {setSelected (loc); setVisible(true)}
  }, []);

 return (
  //Componentes del mapa (View es el contenedor padre)
  //flex hace que ocupe toda la pantalla
    <View style={{ flex: 1 }}>
      {/*Conexion del map ref para usar fittocoodinates, el marcador arranca en mi region*/}
      <MapView ref={map_reference} style={{ flex: 1 }} initialRegion={region}>
        {/*Creacion de marcadores en base a mi json*/}
        {/*Por cada uno rea un marker*/}
        {(filtered as modal[]).map(loc => (
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
            onPress={()=>{setSelected(loc); setVisible(true)}}
            />
        ))}
      </MapView>

      {/* Buscador flotante */}
      <View pointerEvents="box-none" style={styles.floatingWrap}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Buscar por nombre o tipo…"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
              <Text style={styles.clearTxt}>×</Text>
            </Pressable>
          )}
        </View>
      </View>

        {/*Modal*/}

          <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>{selected?.name ?? ""}</Text>
              <Pressable onPress={() => setVisible(false)}><Text style={styles.close}>Cerrar</Text></Pressable>
            </View>

            <Text style={styles.meta}>{selected?.type} · ⭐ {selected?.rating} · ${selected?.price} CLP</Text>
            <Text style={styles.addr}>{selected?.address}</Text>
            {/* Collage principal */}
            {(selected?.images?.length ?? 0) > 0 ? (
              <View style={styles.collageRow}>
                <Image source={{ uri: selected!.images![0] }} style={styles.bigImg} resizeMode="cover" />
                <View style={styles.smallCol}>
                  <Image source={{ uri: selected!.images![1] ?? selected!.images![0] }} style={styles.smallImg} resizeMode="cover" />
                  <Image source={{ uri: selected!.images![2] ?? selected!.images![0] }} style={[styles.smallImg, { marginTop: 8 }]} resizeMode="cover" />
                </View>
              </View>
            ) : (
              <View style={styles.noImg}><Text>Sin imágenes</Text></View>
            )}

            {/* Chips superiores */}
            <View style={styles.chipsRow}>
              <View style={styles.chip}><Text style={styles.chipTxt}>{selected?.type ?? ""}</Text></View>
              <View style={styles.pill}><Text style={styles.pillTxt}>⭐ {selected?.rating?.toFixed(1)}</Text></View>
              <View style={styles.chipAlt}><Text style={styles.chipAltTxt}>${selected?.price} CLP</Text></View>
            </View>

            {/* Tira de thumbnails */}
            {(selected?.images?.length ?? 0) > 1 && (
              <FlatList
                data={selected!.images}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(u, i) => u + i}
                contentContainerStyle={styles.thumbsRow}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.thumb} resizeMode="cover" />
                )}
              />
            )}


            <View style={styles.actions}>
              <Pressable style={styles.btn} onPress={() => selected && abririd(selected.id)}>
                <Text style={styles.btnText}>Ver de nuevo</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnAlt]} onPress={() => setVisible(false)}>
                <Text style={[styles.btnText, { color: "#111" }]}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const W = Dimensions.get("window").width;
const styles = StyleSheet.create({
  floatingWrap: {
    position: "absolute",
    bottom:30,
    left: 16,
    right: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  searchInput: {
    flex: 1,
    color: "#111827",
    fontSize: 16,
    paddingVertical: 10,
  },
  clearBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    marginLeft: 6,
  },
  clearTxt: { color: "#111827", fontSize: 18, fontWeight: "700", lineHeight: 18 },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, gap: 10, maxHeight: "80%", shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: -2 }, elevation: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800" },
  close: { color: "#2563eb", fontWeight: "700" },
  meta: { color: "#374151" },
  addr: { color: "#4b5563", marginBottom: 6 },

  collageRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  bigImg: { width: W - 32 - 120 - 12, height: 200, borderRadius: 14, backgroundColor: "#eee" },
  smallCol: { width: 120 },
  smallImg: { width: 120, height: 96, borderRadius: 12, backgroundColor: "#eee" },

  chipsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  chip: { backgroundColor: "#111827", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  chipTxt: { color: "#fff", fontWeight: "700" },
  pill: { backgroundColor: "#e5e7eb", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  pillTxt: { color: "#111827", fontWeight: "700" },
  chipAlt: { backgroundColor: "#2563eb20", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: "#2563eb40" },
  chipAltTxt: { color: "#2563eb", fontWeight: "700" },

  thumbsRow: { gap: 10, paddingVertical: 6, paddingRight: 4 },
  thumb: { width: 96, height: 72, borderRadius: 10, backgroundColor: "#f3f4f6" },

  image: { width: W - 32, height: 200, borderRadius: 12, backgroundColor: "#eee" },
  noImg: { width: W - 32, height: 200, borderRadius: 12, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },

  actions: { flexDirection: "row", gap: 12, marginTop: 12 },
  btn: { backgroundColor: "#111827", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnAlt: { backgroundColor: "#e5e7eb" },
  btnText: { color: "#fff", fontWeight: "600" }
});
