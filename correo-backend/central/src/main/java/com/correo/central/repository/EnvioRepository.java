package com.correo.central.repository;

import com.correo.central.model.Envio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnvioRepository extends MongoRepository<Envio, String> {

    Optional<Envio> findByTrackingNumber(String trackingNumber);

    Page<Envio> findByEstadoActual(Envio.EstadoEnvio estadoActual, Pageable pageable);

    List<Envio> findByDestinatarioContainingIgnoreCase(String destinatario);
}