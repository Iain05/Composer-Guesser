package org.composerguesser.backend.dto;

public class ComposerSummaryDto {

    private Long composerId;
    private String name;

    public ComposerSummaryDto(Long composerId, String completeName) {
        this.composerId = composerId;
        this.name = completeName;
    }

    public Long getComposerId() { return composerId; }
    public String getName() { return name; }
}
