import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { api } from "@/services/api"
import { storage } from "@/services/storage"
import { useRouter } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"

export default function AnonymousLogin(){
    const router = useRouter()
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
            const response = await api.cadastroAnonimo({ telefone })
            
            if (response.sucesso) {
                Alert.alert("Sucesso", response.mensagem)
                setCodigoEnviado(true)
            }
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
            
            if (response.sucesso && response.token) {
                await storage.saveToken(response.token)
                if (response.usuario) {
                    await storage.saveUser(response.usuario)
                }
                Alert.alert("Sucesso", response.mensagem)
                router.replace("/home")
            }
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Código inválido ou expirado")
        } finally {
            setLoading(false)
        }
    }

    return(
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.select({ios: "padding",android:"height"})}>
        <ScrollView 
        contentContainerStyle ={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
     <View style={style.container }>
         <View style={style.retangulo}>
       <Text style ={style.subtitle}>Para Realizar o Login anônimo solicitamos que informe seu número.</Text>
       <Text style ={style.subtitle}>Enviaremos um código de verificação por SMS para confirmar seu número.</Text>
       </View>
       <View style={style.form}>
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
                  <Text style={style.infoText}>
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
          {loading && <ActivityIndicator size="small" color="#15104D" style={{marginTop: 10}} />}
       </View>
       </View>
       </ScrollView>
       </KeyboardAvoidingView>
    )
}

const style = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center', 
        backgroundColor: "#F2F1FA",
        padding:32,
    },
     retangulo: {
    width: '97%',            
    height: 150,
    padding:15,
    backgroundColor: '#D9D9D9', 
    borderRadius: 15,
  },
    title: {
        fontSize: 32,
        fontWeight: 900,
         color:"#15104D",
    },
       subtitle: {
        padding:10,
        textAlign: "center",
        color: "#000000",
        fontWeight: 600,
        fontSize: 16,

    },
    form:{
        marginTop:24,
        gap: 10,
    },
    footerText:{
        textAlign: "center",
        marginTop:24,
        color:"#000000"
    },
    infoText: {
        textAlign: "center",
        color: "#15104D",
        fontSize: 14,
        marginBottom: 10,
        fontWeight: "500"
    },
})