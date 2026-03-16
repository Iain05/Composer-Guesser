package org.composerguesser.backend.dto;

public class GuessRequestDto {

    private Long excerptId;
    private Long composerId;

    public Long getExcerptId() { return excerptId; }
    public void setExcerptId(Long excerptId) { this.excerptId = excerptId; }

    public Long getComposerId() { return composerId; }
    public void setComposerId(Long composerId) { this.composerId = composerId; }
}
