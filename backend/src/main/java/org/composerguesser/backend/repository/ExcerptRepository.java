package org.composerguesser.backend.repository;

import org.composerguesser.backend.model.Excerpt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExcerptRepository extends JpaRepository<Excerpt, Long> {
}
