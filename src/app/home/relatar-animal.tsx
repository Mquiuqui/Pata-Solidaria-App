import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function RelatarAnimalScreen() {
    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.content}>
                <Text style={styles.title}>Relatar Animal</Text>
                <Text style={styles.subtitle}>
                    Aqui você poderá reportar animais em situação de vulnerabilidade.
                </Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F1FA",
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#15104D",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: "#6B6B6B",
        textAlign: "center",
    },
})
