package com.correo.central.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "envios")
public class Envio {

    @Id
    private String id;

    @Indexed(unique = true)
    private String trackingNumber;

    private EstadoEnvio estadoActual = EstadoEnvio.RECIBIDO;

    private String remitente;
    private String destinatario;

    private List<Evento> historial = new ArrayList<>();

    @CreatedDate
    private Instant fechaCreacion;

    @LastModifiedDate
    private Instant ultimaActualizacion;

    // -----------------------------------------------
    // El servidor genera el tracking, no el cliente.
    // -----------------------------------------------
    public enum EstadoEnvio {
        RECIBIDO,
        EN_TRANSITO,
        EN_SUCURSAL,
        ENTREGADO,
        CANCELADO
    }

    @Data
    @NoArgsConstructor
    public static class Evento {
        private String descripcion;
        private Instant fechaEvento; // NO inicializar aquí: se setea en el constructor
        private String ubicacion;

        public Evento(String descripcion, String ubicacion) {
            this.descripcion = descripcion;
            this.ubicacion = ubicacion;
            this.fechaEvento = Instant.now(); // correcto: en instanciación, no en definición
        }
    }
}