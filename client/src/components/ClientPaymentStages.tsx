import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  ExternalLink,
  Calendar,
  AlertCircle,
  Wallet,
  Play,
  Settings
} from "lucide-react";

// Assuming PaymentOptionsModal is a component that handles the payment options selection
// import PaymentOptionsModal from "./PaymentOptionsModal"; 

// Modal de opciones de pago mejorado
const PaymentOptionsModal = ({ isOpen, onClose, amount, stageName, stageId, projectName }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  const paymentMethods = [
    {
      id: 'mango',
      name: 'Mango',
      alias: '4220058',
      type: 'Alias - Cédula'
    },
    {
      id: 'ueno',
      name: 'Ueno Bank',
      alias: '4220058',
      type: 'Alias - Cédula'
    },
    {
      id: 'solar',
      name: 'Banco Solar',
      alias: 'softwarepar.lat@gmail.com',
      type: 'Alias - Email'
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setShowPaymentDetails(true);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleSendProof = async () => {
    const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
    
    if (isUploading) return; // Prevenir múltiples envíos
    
    try {
      setIsUploading(true); // Mostrar indicador de carga
      
      // Preparar FormData para enviar archivo si existe
      const formData = new FormData();
      formData.append('paymentMethod', selectedMethodData.name);
      
      if (selectedFile) {
        formData.append('proofFile', selectedFile);
        formData.append('proofFileInfo', JSON.stringify({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type
        }));
      }

      // Enviar datos del pago al servidor incluyendo el archivo
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/payment-stages/${stageId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Crear mensaje para WhatsApp
        const whatsappMessage = encodeURIComponent(
          `🎉 ¡Hola! He realizado el pago para el proyecto "${projectName}".\n\n` +
          `📋 Detalles del pago:\n` +
          `• Etapa: ${stageName}\n` +
          `• Monto: $${amount.toFixed(2)}\n` +
          `• Método: ${selectedMethodData.name}\n` +
          `• Alias: ${selectedMethodData.alias}\n\n` +
          `${selectedFile ? '📎 Comprobante adjuntado: ' + selectedFile.name + '\n\n' : 'ℹ️ Comprobante será enviado por WhatsApp\n\n'}` +
          `✅ Notificación enviada automáticamente al equipo por email.\n\n` +
          `Por favor, confirmen la recepción del pago. ¡Gracias!`
        );

        // Número de WhatsApp de SoftwarePar
        const whatsappNumber = '595985990046';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

        // Mostrar mensaje de éxito
        alert('✅ Comprobante enviado exitosamente. Te redirigiremos a WhatsApp para confirmar con el equipo.');
        
        // Cerrar modal primero
        onClose();
        
        // Redirigir a WhatsApp inmediatamente
        window.open(whatsappUrl, '_blank');
        
        // Recargar la página para actualizar el estado del pago
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
      } else {
        let errorMessage = 'Error desconocido';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Error ${response.status}`;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        if (response.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
        
        alert(`❌ Error al enviar el comprobante: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error enviando comprobante:', error);
      alert('❌ Error al enviar el comprobante. Por favor, verifica tu conexión e inténtalo de nuevo.');
    } finally {
      setIsUploading(false); // Ocultar indicador de carga
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {!showPaymentDetails ? 'Selecciona tu método de pago' : 'Datos para transferencia'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {!showPaymentDetails ? (
          <>
            <div className="mb-4 bg-blue-50 p-3 rounded-lg">
              <p className="text-gray-600">Etapa: <span className="font-bold text-blue-800">{stageName}</span></p>
              <p className="text-lg font-bold text-green-600">Monto: ${amount.toFixed(2)}</p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-md font-medium text-gray-700">Selecciona el método de pago:</h3>
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className="border-2 p-4 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                  onClick={() => handleMethodSelect(method.id)}
                >
                  <p className="font-semibold text-blue-700 text-lg">{method.name}</p>
                  <p className="text-sm text-gray-600">{method.type}: {method.alias}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <button 
                onClick={() => setShowPaymentDetails(false)}
                className="text-blue-600 hover:text-blue-800 text-sm mb-3"
              >
                ← Volver a métodos de pago
              </button>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 text-lg mb-2">
                  Datos para {paymentMethods.find(m => m.id === selectedMethod)?.name}
                </h3>
                <div className="space-y-2">
                  <p><strong>Alias:</strong> {paymentMethods.find(m => m.id === selectedMethod)?.alias}</p>
                  <p><strong>Monto a transferir:</strong> <span className="text-xl font-bold text-green-700">${amount.toFixed(2)}</span></p>
                  <p><strong>Concepto:</strong> {stageName} - {projectName}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Subir comprobante (opcional):</h4>
              <input 
                type="file" 
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceptados: JPG, PNG, PDF
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Importante:</strong> Una vez realizada la transferencia, haz clic en "Enviar Comprobante" 
                para notificarnos por email y WhatsApp con todos los detalles del pago.
              </p>
            </div>

            <button 
              onClick={handleSendProof}
              disabled={isUploading}
              className={`w-full py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 font-medium text-lg transition-all duration-200 ${
                isUploading 
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {selectedFile ? '📤 Subiendo comprobante...' : '📧 Enviando notificación...'}
                </div>
              ) : (
                '📧📱 Enviar Comprobante y Notificar'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};


interface PaymentStage {
  id: number;
  projectId: number;
  stageName: string;
  stagePercentage: number;
  amount: string;
  requiredProgress: number;
  status: string;
  paymentLink?: string;
  mercadoPagoId?: string;
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
}

interface ClientPaymentStagesProps {
  projectId: number;
  projectProgress: number;
  projectPrice: number;
}

export default function ClientPaymentStages({ 
  projectId, 
  projectProgress = 0,
  projectPrice = 0 
}: ClientPaymentStagesProps) {
  const { toast } = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: stages, isLoading, error } = useQuery({
    queryKey: ["payment-stages", projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/projects/${projectId}/payment-stages`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching payment stages:", error);
        throw error;
      }
    },
    enabled: !!projectId,
    retry: 2,
    staleTime: 30000,
  });

  // Obtener información del proyecto para el nombre
  const { data: projectInfo } = useQuery({
    queryKey: ["project-info", projectId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/projects/${projectId}`);
      return await response.json();
    },
    enabled: !!projectId,
  });

  const getStatusInfo = (status: string, stage: PaymentStage) => {
    const configs = {
      pending: { 
        label: "Pendiente", 
        variant: "secondary" as const, 
        icon: Clock,
        color: "text-gray-500",
        bgColor: "bg-gray-50 border-gray-200",
        description: `Se activará cuando el proyecto tenga ${stage.requiredProgress}% de progreso`
      },
      available: { 
        label: "¡Disponible para Pagar!", 
        variant: "default" as const, 
        icon: Wallet,
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-300",
        description: "Esta etapa está lista para ser pagada"
      },
      paid: { 
        label: "✅ Pagado", 
        variant: "default" as const, 
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        description: stage.paidDate ? `Pagado el ${new Date(stage.paidDate).toLocaleDateString()}` : "Completado"
      },
      overdue: { 
        label: "Vencido", 
        variant: "destructive" as const, 
        icon: AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        description: "Esta etapa necesita ser pagada"
      },
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getTotalPaid = () => {
    if (!stages) return 0;
    return stages
      .filter((stage: PaymentStage) => stage.status === 'paid')
      .reduce((total: number, stage: PaymentStage) => total + parseFloat(stage.amount), 0);
  };

  const getNextPaymentStage = () => {
    return stages?.find((stage: PaymentStage) => stage.status === 'available');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-32 bg-muted rounded-lg"></div>
        <div className="animate-pulse h-96 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    console.error("Payment stages error details:", error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error al cargar las etapas de pago
          </h3>
          <p className="text-red-700 mb-4">
            No se pudieron cargar las etapas de pago. Por favor, intenta recargar.
          </p>
          <div className="text-xs text-red-600 mb-4 bg-white p-2 rounded border">
            Error: {error instanceof Error ? error.message : 'Error desconocido'}
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Recargar Página
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Debug logging
  console.log("ClientPaymentStages - Project ID:", projectId);
  console.log("ClientPaymentStages - Stages data:", stages);
  console.log("ClientPaymentStages - Is loading:", isLoading);
  console.log("ClientPaymentStages - Error:", error);

  if (!stages || stages.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6 text-center">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-amber-600" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            Etapas de Pago Pendientes
          </h3>
          <p className="text-amber-700 mb-4">
            Las etapas de pago serán configuradas una vez que el proyecto sea aprobado por nuestro equipo.
          </p>
          <div className="bg-white p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-600">
              💡 Una vez configuradas, podrás pagar en 4 etapas del 25% cada una
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const nextPayment = getNextPaymentStage();

  return (
    <div className="space-y-6" data-payment-stages>
      {/* Header with Summary */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <DollarSign className="h-6 w-6" />
            Sistema de Pagos por Etapas - SoftwarePar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Explicación del Sistema */}
          <div className="bg-white p-4 rounded-lg border border-blue-200 mb-6">
            <h4 className="font-semibold text-blue-800 mb-3 text-lg">🚀 ¿Cómo funciona nuestro sistema?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-700 mb-2">📋 Proceso de Pago:</h5>
                <ul className="space-y-1 text-blue-600">
                  <li>• <strong>4 etapas del 25% cada una</strong></li>
                  <li>• Solo pagas cuando hay progreso real</li>
                  <li>• Te avisamos cuando puedes pagar</li>
                  <li>• Cada pago desbloquea la siguiente fase</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-700 mb-2">💡 Ventajas para ti:</h5>
                <ul className="space-y-1 text-blue-600">
                  <li>• <strong>Pago seguro y gradual</strong></li>
                  <li>• Control total del progreso</li>
                  <li>• Sin sorpresas ni pagos adelantados</li>
                  <li>• Garantía de avance constante</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">${projectPrice.toFixed(2)}</div>
              <div className="text-sm text-blue-600">Total del Proyecto</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${getTotalPaid().toFixed(2)}</div>
              <div className="text-sm text-green-600">Ya Pagado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{projectProgress}%</div>
              <div className="text-sm text-purple-600">Progreso Actual</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progreso del Proyecto:</span>
              <span className="font-medium">{projectProgress}%</span>
            </div>
            <Progress value={projectProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Next Payment Alert */}
      {nextPayment && (
        <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-green-800 text-xl">
                    🎉 ¡Tu Pago Está Listo!
                  </h3>
                  <Badge className="bg-green-500 text-white">DISPONIBLE</Badge>
                </div>

                <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">📋 Detalles del Pago:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-green-600">Etapa:</span>
                      <div className="font-medium text-green-800">{nextPayment.stageName}</div>
                    </div>
                    <div>
                      <span className="text-green-600">Monto:</span>
                      <div className="font-bold text-lg text-green-800">${parseFloat(nextPayment.amount).toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>🔄 ¿Qué pasa después del pago?</strong><br />
                    Una vez confirmado tu pago, nuestro equipo comenzará inmediatamente a trabajar en esta etapa. 
                    Recibirás actualizaciones regulares del progreso.
                  </p>
                </div>

                {/* New Payment Options Modal Integration */}
                <PaymentOptionsModal 
                  isOpen={showPaymentModal}
                  onClose={() => setShowPaymentModal(false)}
                  amount={parseFloat(nextPayment.amount)}
                  stageName={nextPayment.stageName}
                  stageId={nextPayment.id}
                  projectName={projectInfo?.name || "Proyecto"}
                />

                <Button 
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-lg py-3 px-6 shadow-lg"
                  size="lg"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Pagar ${parseFloat(nextPayment.amount).toFixed(2)} - Iniciar Trabajo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Stages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Etapas de Pago ({stages.length}/4)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage: PaymentStage, index: number) => {
              const statusInfo = getStatusInfo(stage.status, stage);
              const Icon = statusInfo.icon;

              return (
                <div
                  key={stage.id}
                  className={`p-4 rounded-lg border transition-all ${statusInfo.bgColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          stage.status === 'paid' ? 'bg-green-500 text-white' :
                          stage.status === 'available' ? 'bg-blue-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {stage.status === 'paid' ? '✓' : index + 1}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{stage.stageName}</h4>
                          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                          <div>
                            <span className="text-muted-foreground">Porcentaje:</span>
                            <div className="font-medium">{stage.stagePercentage}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Monto:</span>
                            <div className="font-bold text-lg">${parseFloat(stage.amount).toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Progreso Requerido:</span>
                            <div className="font-medium">{stage.requiredProgress}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Estado:</span>
                            <div className={`font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {statusInfo.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {stage.status === 'available' && (
                        <Button 
                          onClick={() => setShowPaymentModal(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <Wallet className="h-4 w-4 mr-1" />
                          Pagar
                        </Button>
                      )}

                      {stage.status === 'pending' && (
                        <div className="text-xs text-center text-gray-500 bg-gray-50 p-2 rounded border">
                          Disponible al<br />{stage.requiredProgress}% progreso
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-purple-800 text-xl">🎯 Metodología SoftwarePar - Desarrollo por Etapas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Metodología */}
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3">🏗️ Nuestra Metodología de Trabajo:</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold">1</span>
                  </div>
                  <h5 className="font-medium text-purple-700">Anticipo (25%)</h5>
                  <p className="text-purple-600">Iniciamos desarrollo inmediatamente</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <h5 className="font-medium text-purple-700">50% Progreso (25%)</h5>
                  <p className="text-purple-600">Funcionalidades core desarrolladas</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h5 className="font-medium text-purple-700">Pre-entrega (25%)</h5>
                  <p className="text-purple-600">90% completo, revisiones finales</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-bold">4</span>
                  </div>
                  <h5 className="font-medium text-purple-700">Entrega (25%)</h5>
                  <p className="text-purple-600">Proyecto 100% terminado</p>
                </div>
              </div>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Beneficios para Ti:
                </h4>
                <ul className="space-y-1 text-green-700">
                  <li>• <strong>Pago gradual:</strong> Solo pagas por progreso real</li>
                  <li>• <strong>Control total:</strong> Ves el avance antes de cada pago</li>
                  <li>• <strong>Sin riesgo:</strong> No hay pagos adelantados grandes</li>
                  <li>• <strong>Transparencia:</strong> Comunicación constante del progreso</li>
                  <li>• <strong>Calidad:</strong> Cada etapa es revisada antes del siguiente pago</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Garantías SoftwarePar:
                </h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• <strong>Inicio inmediato:</strong> Trabajamos desde el primer pago</li>
                  <li>• <strong>Actualizaciones frecuentes:</strong> Te mantenemos informado</li>
                  <li>• <strong>Calidad garantizada:</strong> Revisiones en cada etapa</li>
                  <li>• <strong>Comunicación directa:</strong> Canal de comunicación 24/7</li>
                  <li>• <strong>Entrega puntual:</strong> Cumplimos fechas establecidas</li>
                </ul>
              </div>
            </div>

            {/* Nota importante */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">💡 Importante:</h4>
                  <p className="text-sm text-yellow-700">
                    Este sistema nos permite mantener la mejor calidad en cada proyecto, ya que trabajamos con 
                    recursos asegurados y tu tienes control total del progreso. Es una metodología win-win 
                    que hemos perfeccionado en años de experiencia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}