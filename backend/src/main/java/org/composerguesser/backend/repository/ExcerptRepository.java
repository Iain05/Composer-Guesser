package org.composerguesser.backend.repository;

import org.composerguesser.backend.model.Excerpt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ExcerptRepository extends JpaRepository<Excerpt, Long> {

    /**
     * Returns a random excerpt from those with the lowest times_used value.
     * Ties within the minimum group are broken randomly.
     */
    @Query(value = """
            SELECT * FROM tbl_excerpt
            WHERE times_used = (SELECT MIN(times_used) FROM tbl_excerpt)
            ORDER BY RANDOM()
            LIMIT 1
            """, nativeQuery = true)
    Optional<Excerpt> findLeastUsedRandom();
}
