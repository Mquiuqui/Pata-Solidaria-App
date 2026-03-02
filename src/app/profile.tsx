import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/homem-com-seu-cão-que-joga-no-parque.png")}
          style={styles.image}
        />
        <TouchableOpacity
          style={[styles.floatingButton, styles.leftButton]}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Feather name={isEditing ? "check" : "edit"} size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.floatingButton, styles.rightButton]}>
          <Feather
            name={isEditing ? "plus" : "arrow-down"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>Zezinho</Text>

        <Text style={styles.label}>Sobre mim</Text>

        {isEditing ? (
          <TextInput
            style={styles.input}
            placeholder="São Paulo"
            placeholderTextColor="#999"
          />
        ) : (
          <Text style={styles.text}>Olá!</Text>
        )}

        <View style={styles.badge}>
          <Text style={styles.badgeText}>ONG 123</Text>
        </View>

        <Text style={styles.label}>Contato</Text>

        {isEditing ? (
          <TextInput
            style={styles.input}
            placeholder="(xx)xxxxx-xxxx"
            placeholderTextColor="#999"
          />
        ) : (
          <Text style={styles.text}>(xx)xxxxx-xxxx</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAEAF2",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 350,
  },
  floatingButton: {
    position: "absolute",
    bottom: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1B145A",
    justifyContent: "center",
    alignItems: "center",
  },
  leftButton: {
    left: 20,
  },
  rightButton: {
    right: 20,
  },
  content: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B145A",
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    color: "#1B145A",
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    backgroundColor: "#F4F4F4",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  badge: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#E0E0F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#1B145A",
    fontWeight: "600",
  },
});