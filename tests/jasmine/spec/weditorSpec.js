describe("Weditor", function() {
	var subject;

	beforeEach(function() {
		$("body").append(
			'<div id="fragment">' +
			'	<div class="weditor-container">' +
			'		<div class="weditor">' +
			'			<textarea class="wedit-input" id="it"></textarea>' +
			'		</div>' +
			'	</div>' +
			'</div>'
		);
	});

	afterEach(function () {
        $("#fragment").remove();
    });

    describe("on initialization", function() {
    	beforeEach(function() {
    		$("#it").mdmagick();
    	});

    	it("should append the preview right after the wedit-inputs parent", function() {
    		expect($(".weditor").next().prop("class")).toBe("mdm-preview mdm-control");
    	});

    	it("should prepend the button bar before the wedit-input", function() {
    		expect($("#it").prev().prop("class")).toBe("mdm-buttons mdm-control");
    	});

    	it("should show the preview", function() {
    		expect($(".mdm-preview").is(":visible")).toBe(true);
    	});

    	it("should hide the wedit-input", function() {
    		expect($("#it").is(":visible")).toBe(false);
    	});

    	it("should hide the button bar", function() {
    		expect($(".mdm-buttons").is(":visible")).toBe(false);
    	});

    	describe("clicking the preview box", function() {
    		beforeEach(function() {
    			$(".mdm-preview").click();
    		});

    		it("should show the wedit-input", function() {
    			expect($("#it").is(":visible")).toBe(true);
    		});

    		it("should show the button bar", function() {
    			expect($(".mdm-buttons").is(":visible")).toBe(true);
    		});

    		describe("when Bold button is clicked", function() {
    			beforeEach(function() {
    				$(".mdm-bold").click();
    			});

    			it("the text should be bold", function() {
    				expect($("#it").val()).toBe("**strong text**");
    			});
    		});
    	});
    });
});