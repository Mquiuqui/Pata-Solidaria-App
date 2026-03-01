import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { api } from "@/services/api"
import { storage } from "@/services/storage"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native"

const PADDING_H = 24
const PADDING_V = 20
const MIN_BOX_HEIGHT = 100
const MAX_FORM_WIDTH = 400

export default function AnonymousLogin(){
    const router = useRouter()
    const { width: screenWidth } = useWindowDimensions()
    const [telefone, setTelefone] = useState("")
    const [codigo, setCodigo] = useState("")
    const [codigoEnviado, setCodigoEnviado] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleEnviarCodigo = async () => {
        if (!telefone.trim()) {
            Alert.alert("Erro", "Por favor, informe o número de telefone")
            return
        }

        setLoading(true)
        try {
            await api.solicitarCodigoAnonimo({ telefone })
            setCodigoEnviado(true)
            Alert.alert(
                "Código enviado",
                "Se o número estiver correto, você receberá um código por SMS."
            )
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Erro ao enviar código")
        } finally {
            setLoading(false)
        }
    }

    const handleValidarCodigo = async () => {
        if (!codigo.trim()) {
            Alert.alert("Erro", "Por favor, informe o código de verificação")
            return
        }

        setLoading(true)
        try {
            const response = await api.validarCodigoAnonimo({ telefone, codigo })

            if (response.token) {
                await storage.saveToken(response.token)
                if (response.usuario) {
                    await storage.saveUser({ ...response.usuario, anonimo: true })
                } else {
                    await storage.saveUser({ anonimo: true })
                }
                router.replace("/home")
            }
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Código inválido ou expirado. Solicite um novo.")
        } finally {
            setLoading(false)
        }
    }

    const contentWidth = Math.min(screenWidth - PADDING_H * 2, MAX_FORM_WIDTH)
    const isNarrow = screenWidth < 360

    return (
        <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.select({ ios: "padding", android: "height" })}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingHorizontal: isNarrow ? 16 : PADDING_H, paddingVertical: isNarrow ? 16 : PADDING_V },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.retangulo, { width: contentWidth, minHeight: MIN_BOX_HEIGHT }]}>
                    <Text style={styles.subtitle}>
                        Para realizar o login anônimo solicitamos que informe seu número.
                    </Text>
                    <Text style={styles.subtitle}>
                        Enviaremos um código de verificação por SMS para confirmar seu número.
                    </Text>
                </View>
                <View style={[styles.form, { width: contentWidth }]}>
          {!codigoEnviado ? (
              <>
                  <Input 
                      placeholder="Telefone"
                      keyboardType="numeric"
                      value={telefone}
                      onChangeText={setTelefone}
                      editable={!loading}
                  />
                  <Button 
                      label={loading ? "Enviando..." : "Receber Código"} 
                      onPress={handleEnviarCodigo}
                      disabled={loading}
                  />
              </>
          ) : (
              <>
                  <Text style={styles.infoText}>
                      Código enviado para {telefone}
                  </Text>
                  <Input 
                      placeholder="Código de verificação"
                      keyboardType="numeric"
                      value={codigo}
                      onChangeText={setCodigo}
                      editable={!loading}
                      maxLength={6}
                  />
                  <Button 
                      label={loading ? "Validando..." : "Validar Código"} 
                      onPress={handleValidarCodigo}
                      disabled={loading}
                  />
                  <Button 
                      label="Reenviar Código" 
                      onPress={() => {
                          setCodigoEnviado(false)
                          setCodigo("")
                      }}
                      disabled={loading}
                  />
              </>
          )}
                    {loading && (
                        <ActivityIndicator size="small" color="#15104D" style={styles.loader} />
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#F2F1FA",
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
    },
    retangulo: {
        padding: 16,
        backgroundColor: "#D9D9D9",
        borderRadius: 15,
    },
    subtitle: {
        paddingVertical: 6,
        paddingHorizontal: 4,
        textAlign: "center",
        color: "#000000",
        fontWeight: "600",
        fontSize: 15,
    },
    form: {
        marginTop: 24,
        gap: 12,
    },
    infoText: {
        textAlign: "center",
        color: "#15104D",
        fontSize: 14,
        marginBottom: 10,
        fontWeight: "500",
    },
    loader: {
        marginTop: 10,
    },
})