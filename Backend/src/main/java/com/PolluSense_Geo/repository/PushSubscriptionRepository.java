package com.PolluSense_Geo.repository;

import com.PolluSense_Geo.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByUserId(Long userId);

    void deleteByEndpoint(String endpoint);

    boolean existsByEndpoint(String endpoint);
}
