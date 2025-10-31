import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import locales from "../../assets/data/locales.json";

type Loc = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  type: string;
  price: number;
  rating: number;
  images?: string[];
};

export default function Mapa() {
  const mapRef = useRef<MapView>(null);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<Loc | null>(null);

  const initialRegion = {
    latitude: -33.4489,
    longitude: -70.6693,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    if (!mapRef.current || locales.length === 0) return;
    const coords = (locales as Loc[]).map(l => ({ latitude: l.lat, longitude: l.lng }));
    mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true });
  }, []);

  const openById = useCallback((id: string) => {
    const loc = (locales as Loc[]).find(x => x.id === id) || null;
    if (loc) { setSelected(loc); setVisible(true); }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={initialRegion}>
        {(locales as Loc[]).map(loc => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.lat, longitude: loc.lng }}
            title={loc.name}
            description={loc.address}
            onPress={() => { setSelected(loc); setVisible(true); }}
          />
        ))}
      </MapView>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>{selected?.name ?? ""}</Text>
              <Pressable onPress={() => setVisible(false)}><Text style={styles.close}>Cerrar</Text></Pressable>
            </View>

            <Text style={styles.meta}>{selected?.type} · ⭐ {selected?.rating} · ${selected?.price} CLP</Text>
            <Text style={styles.addr}>{selected?.address}</Text>

            <FlatList
              data={selected?.images ?? []}
              keyExtractor={(uri, i) => uri + i}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
              )}
              ListEmptyComponent={<View style={styles.noImg}><Text>Sin imágenes</Text></View>}
              contentContainerStyle={{ gap: 12 }}
            />

            <View style={styles.actions}>
              <Pressable style={styles.btn} onPress={() => selected && openById(selected.id)}>
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
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, gap: 10, maxHeight: "75%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  close: { color: "#2563eb", fontWeight: "600" },
  meta: { color: "#374151" },
  addr: { color: "#4b5563", marginBottom: 6 },
  image: { width: W - 32, height: 200, borderRadius: 12, backgroundColor: "#eee" },
  noImg: { width: W - 32, height: 200, borderRadius: 12, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", gap: 12, marginTop: 12 },
  btn: { backgroundColor: "#111827", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnAlt: { backgroundColor: "#e5e7eb" },
  btnText: { color: "#fff", fontWeight: "600" }
});
