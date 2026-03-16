package org.composerguesser.backend.repository;

import org.composerguesser.backend.model.UserPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface UserPointRepository extends JpaRepository<UserPoint, Long> {
    boolean existsByUserIdAndExcerptDayDate(Long userId, LocalDate date);
}
